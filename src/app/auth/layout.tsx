import React, { ReactNode } from 'react';
import AuthLayoutContent from './layout-content';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <AuthLayoutContent>{children}</AuthLayoutContent>
    );
}
