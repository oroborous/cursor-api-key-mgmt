import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  context: RouteParams
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('api_keys')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteParams
) {
  try {
    const params = await Promise.resolve(context.params);
    const { id } = params;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
} 