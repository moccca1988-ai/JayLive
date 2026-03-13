import { NextResponse } from 'next/server';
import { db, Drop, DropOption } from '@/modules/live-drops/server/db';
import { broadcastDropUpdate } from '@/modules/live-drops/server/livekit';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  const activeDrop = db.drops.find(d => d.status !== 'ENDED');
  
  if (!activeDrop) {
    return NextResponse.json({ drop: null });
  }

  const options = db.drop_options.filter(s => s.drop_id === activeDrop.id);
  
  let userReservation = null;
  if (userId) {
    userReservation = db.drop_reservations.find(r => r.drop_id === activeDrop.id && r.user_id === userId);
  }

  return NextResponse.json({
    drop: activeDrop,
    options,
    userReservation
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  if (action === 'CREATE') {
    const { title, description, price, optionLabel, options } = body;
    
    // End any existing active drop
    db.drops.forEach(d => {
      if (d.status === 'ACTIVE' || d.status === 'FULL') {
        d.status = 'ENDED';
      }
    });

    const dropId = Date.now().toString();
    const newDrop: Drop = {
      id: dropId,
      host_id: 'Host',
      title,
      description,
      price,
      status: 'ACTIVE',
      created_at: Date.now()
    };

    db.drops.push(newDrop);

    const dropOptions: DropOption[] = Object.entries(options).map(([option_value, stock]) => ({
      id: `${dropId}-${option_value}`,
      drop_id: dropId,
      option_label: optionLabel || 'Option',
      option_value,
      stock: Number(stock),
      reserved: 0
    }));

    db.drop_options.push(...dropOptions);

    await broadcastDropUpdate();
    return NextResponse.json({ success: true, drop: newDrop });
  }

  if (action === 'END') {
    const activeDrop = db.drops.find(d => d.status !== 'ENDED');
    if (activeDrop) {
      activeDrop.status = 'ENDED';
      await broadcastDropUpdate();
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
