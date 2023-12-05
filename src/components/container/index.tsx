import { ReactNode } from 'react';

const Container = ({ children }: { children: ReactNode }) => {
    return (
        <div className="w-full max-w-6xl px-4 mx-auto">
            {children}
        </div>
    )
}

export default Container