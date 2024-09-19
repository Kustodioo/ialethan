import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
};

export default Layout;