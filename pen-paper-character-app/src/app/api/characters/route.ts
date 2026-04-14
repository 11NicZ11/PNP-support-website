import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Empfangene Daten:', body);
    
    const character = await prisma.character.create({
      data: {
        name: body.name,
        level: body.level || 1,
        race: body.race || '',
        class: body.class || '',
        background: body.background || '',
        alignment: body.alignment || '',
        experience: body.experience || 0,
        strength: body.strength || 10,
        dexterity: body.dexterity || 10,
        constitution: body.constitution || 10,
        intelligence: body.intelligence || 10,
        wisdom: body.wisdom || 10,
        charisma: body.charisma || 10,
        maxHp: body.maxHp || 10,
        currentHp: body.maxHp || 10,
        tempHp: 0,
        armorClass: body.armorClass || 10,
        speed: body.speed || 30,
        proficiencyBonus: 2,
        skills: "{}",
        spells: "[]",
        inventory: "[]",
        features: "[]",
        notes: body.notes || "",
        customFields: "{}",
      },
    });
    
    console.log('Charakter erstellt:', character);
    return NextResponse.json(character, { status: 201 });
  } catch (error: any) {
    console.error('Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Charakters', details: error?.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(characters);
  } catch (error: any) {
    console.error('Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Charaktere', details: error?.message || 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}