import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { buyerSchema } from '@/validations/buyer';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'User does not belong to an organization' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.BuyerWhereInput = {
      organizationId: dbUser.organizationId,
      ...(status !== '' && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { gstNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.buyer.count({ where }),
    ]);

    return NextResponse.json({
      data: buyers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ error: 'Failed to fetch buyers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'User does not belong to an organization' }, { status: 403 });
    }

    const body = await request.json();
    
    // Clean up empty strings to undefined
    if (body.preferredPaymentTerms === '') body.preferredPaymentTerms = undefined;
    if (body.creditLimit === '') body.creditLimit = undefined;

    const validatedData = buyerSchema.parse(body);

    const buyer = await prisma.buyer.create({
      data: {
        organizationId: dbUser.organizationId,
        ...validatedData,
        preferredPaymentTerms: validatedData.preferredPaymentTerms || null,
        creditLimit: validatedData.creditLimit ? new Prisma.Decimal(validatedData.creditLimit) : null,
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Error creating buyer:', err);
    return NextResponse.json({ error: 'Failed to create buyer' }, { status: 500 });
  }
}
