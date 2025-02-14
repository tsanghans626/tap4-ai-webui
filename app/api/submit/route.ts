/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/db/prisma/client';

// submit table empty -> stop

// filter status
// isFeature (priority)
// time order

// when crawler is done
// insert web_nav table (tags <- tags[0] or 'other')
// update submit table status

export async function POST(req: NextRequest) {
  try {
    // Get Authorization
    const authHeader = req.headers.get('Authorization');

    // Check Authorization and Verify token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header is missing or malformed' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const submitKey = process.env.SUBMIT_AUTH_KEY;
    // check key
    const isValid = submitKey === token;
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const prisma = createClient();

    // 从请求体中获取参数
    const { email, url, name } = await req.json();

    // 检查参数是否存在
    if (!email || !url || !name) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 检查 URL 是否已存在
    const existingEntry = await prisma.webNavigation.findFirst({ where: { url } });

    if (existingEntry) {
      return NextResponse.json({ message: 'Success' });
    }

    // 插入新数据
    await prisma.submit.create({
      data: {
        email,
        url,
        name,
      },
    });

    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ error: Error }, { status: 500 });
  }
}
