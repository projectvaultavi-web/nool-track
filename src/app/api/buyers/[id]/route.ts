import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { buyerSchema } from '@/validations/buyer';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const buyer = await prisma.buyer.findFirst({
      where: {
        id: id,
        organizationId: dbUser.organizationId,
      },
    });

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ error: 'Failed to fetch buyer' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingBuyer = await prisma.buyer.findFirst({
      where: { id: id, organizationId: dbUser.organizationId },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const body = await request.json();
    
    // Clean up empty strings
    if (body.preferredPaymentTerms === '') body.preferredPaymentTerms = undefined;
    if (body.creditLimit === '') body.creditLimit = undefined;

    const validatedData = buyerSchema.parse(body);

    const buyer = await prisma.buyer.update({
      where: { id: id },
      data: {
        ...validatedData,
        preferredPaymentTerms: validatedData.preferredPaymentTerms || null,
        creditLimit: validatedData.creditLimit !== undefined ? new Prisma.Decimal(validatedData.creditLimit) : null,
      },
    });

    return NextResponse.json(buyer);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Error updating buyer:', err);
    return NextResponse.json({ error: 'Failed to update buyer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingBuyer = await prisma.buyer.findFirst({
      where: { id: id, organizationId: dbUser.organizationId },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.buyer.update({
      where: { id: id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json({ error: 'Failed to delete buyer' }, { status: 500 });
  }
}
