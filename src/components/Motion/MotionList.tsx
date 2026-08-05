import {motion} from 'framer-motion';
import {ReactNode} from 'react';

const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.03,
        },
    },
};

interface MotionListProps {
    children: ReactNode;
    className?: string;
}

export const MotionList = ({ children, className }: MotionListProps) => (
    <motion.div
        className={className}
        variants={listVariants}
        initial="hidden"
        animate="visible"
    >
        {children}
    </motion.div>
);
