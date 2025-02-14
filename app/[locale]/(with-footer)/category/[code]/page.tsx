/* eslint-disable react/jsx-props-no-spreading */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/prisma/client';

import { InfoPageSize, RevalidateOneHour } from '@/lib/constants';

import Content from './Content';

export const revalidate = RevalidateOneHour * 6;

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const prisma = createClient();
  const categoryList = await prisma.navigationCategory.findMany({ where: { name: params.code } });

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  return {
    title: categoryList[0].title,
  };
}

export default async function Page({ params }: { params: { code: string } }) {
  const prisma = createClient();
  const [categoryList, navigationList] = await Promise.all([
    prisma.navigationCategory.findMany({ where: { name: params.code } }),
    prisma.webNavigation.findMany({ where: { category_name: params.code }, take: InfoPageSize - 1 }),
  ]);

  if (!categoryList || !categoryList[0]) {
    notFound();
  }

  return (
    <Content
      headerTitle={categoryList[0]!.title || params.code}
      navigationList={navigationList!}
      currentPage={1}
      total={navigationList!.length}
      pageSize={InfoPageSize}
      route={`/category/${params.code}`}
    />
  );
}
