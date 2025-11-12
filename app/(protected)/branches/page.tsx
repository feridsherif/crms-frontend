import React from 'react';
import BranchList from './components/branch-list';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Branches</h1>
      <BranchList />
    </div>
  );
}
