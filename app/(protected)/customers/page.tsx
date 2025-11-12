import React from 'react';
import CustomerList from './components/customer-list2';

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Customers</h1>
      <CustomerList />
    </div>
  );
}
