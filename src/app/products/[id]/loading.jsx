import React from 'react';
import Container from '@/layout/Container';

const Loading = () => {
  return (
    <Container>
      <div className="py-10 animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="aspect-square w-full bg-slate-200 rounded-3xl"></div>
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded-lg"></div>
            <div className="h-6 w-44 bg-slate-200 rounded"></div>
            <div className="h-12 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-24 w-full bg-slate-200 rounded-lg"></div>
            <div className="h-14 w-full bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Loading;
