import {semantic} from "@/constants/colors";
import styled from "@emotion/styled";

export const Sticky = styled.div<{top?: string; bottom?: string; zIndex?: number; backgroundColor?: string}>`
    position: sticky;
    top: ${({top}) => top};
    bottom: ${({bottom}) => bottom};
    z-index: ${props => props.zIndex ?? 200};
    background-color: ${props => props.backgroundColor ?? semantic.bg.default};
};`