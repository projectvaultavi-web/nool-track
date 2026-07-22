import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_WASTAGE_THRESHOLDS } from '@/lib/constants';
import { ProcessType } from '@prisma/client';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, phone, gstNumber } = body;

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    let organization;

    if (!dbUser.organizationId) {
      // Create new organization and link user
      organization = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: companyName,
            phone: phone || null,
            gstNumber: gstNumber || null,
          },
        });

        // Create default wastage thresholds
        const thresholdData = Object.entries(DEFAULT_WASTAGE_THRESHOLDS).map(
          ([processType, maxPercentage]) => ({
            organizationId: org.id,
            processType: processType as ProcessType,
            maxWastagePercentage: maxPercentage,
          })
        );

        await tx.wastageThreshold.createMany({
          data: thresholdData,
        });

        await tx.user.update({
          where: { id: dbUser.id },
          data: { organizationId: org.id },
        });

        return org;
      });
    } else {
      // Update existing organization
      organization = await prisma.organization.update({
        where: { id: dbUser.organizationId },
        data: {
          name: companyName,
          phone: phone || null,
          gstNumber: gstNumber || null,
        },
      });
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Organization error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
      include: { organization: true },
    });

    if (!dbUser || !dbUser.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization: dbUser.organization });
  } catch (error) {
    console.error('Get Organization error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
