import {motion} from 'framer-motion';
import {ReactNode} from 'react';

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 26 },
    },
};

interface MotionItemProps {
    children: ReactNode;
    className?: string;
}

export const MotionItem = ({ children, className }: MotionItemProps) => (
    <motion.div className={className} variants={itemVariants}>
        {children}
    </motion.div>
);
