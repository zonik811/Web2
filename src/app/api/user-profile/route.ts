import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-admin';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILE,
            [Query.equal('userId', userId), Query.limit(1)]
        );

        if (response.documents.length > 0) {
            return NextResponse.json(response.documents[0]);
        }

        return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    } catch (error: any) {
        console.error('Error obteniendo perfil:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
