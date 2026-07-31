import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

interface MotionEmptyProps {
    children: ReactNode;
    className?: string;
}

export const MotionEmpty = ({ children, className }: MotionEmptyProps) => (
    <motion.div
        className={className}
        animate={{ y: [0, -7, 0] }}
        transition={{
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
        }}
    >
        {children}
    </motion.div>
);
