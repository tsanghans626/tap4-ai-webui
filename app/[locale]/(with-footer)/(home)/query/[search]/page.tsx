import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { createClient } from '@/db/prisma/client';
import { getTranslations } from 'next-intl/server';

import { RevalidateOneHour } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import Empty from '@/components/Empty';
import Faq from '@/components/Faq';
import WebNavCardList from '@/components/webNav/WebNavCardList';

import { TagList } from '../../Tag';
import Loading from './loading';

const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), { ssr: false });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  };
}

export const revalidate = RevalidateOneHour / 2;

export default async function Page({ params }: { params: { search?: string } }) {
  const prisma = createClient();
  const t = await getTranslations('Home');
  const categoryList = await prisma.navigationCategory.findMany();
  const dataList = await prisma.webNavigation.findMany({
    where: { detail: { contains: `%${decodeURI(params?.search || '')}%` } },
  });

  return (
    <Suspense fallback={<Loading />}>
      <div className='mb-10 mt-5'>
        {params?.search && (
          <TagList
            data={categoryList!.map((item) => ({
              id: String(item.id),
              name: item.name!,
              href: `/category/${item.name}`,
            }))}
          />
        )}
      </div>
      <section className='flex flex-col gap-5'>
        {dataList && !!dataList.length && params?.search ? (
          <>
            <h2 className='mb-1 text-left text-[18px] lg:text-2xl'>{t('result')}</h2>
            <WebNavCardList dataList={dataList!} />
          </>
        ) : (
          <Empty title={t('empty')} />
        )}
      </section>
      <Separator className='mx-auto my-10 h-px w-4/5 bg-[#2C2D36] lg:my-16' />
      <Faq />
      <ScrollToTop />
    </Suspense>
  );
}
