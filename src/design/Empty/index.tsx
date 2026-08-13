import {Empty as AntdEmpty} from 'antd';

import emptyTable from '@/assets/images/empty-table.png';
import empty from '@/assets/images/empty.png';
import noAuth from '@/assets/images/no-auth.png';
import noData from '@/assets/images/no-data.png';
import noTarget from '@/assets/images/no-target.png';

import type {EmptyProps as AntdEmptyProps} from 'antd';
import { css } from '@emotion/css';

export type EmptyImageType = 'empty-table' | 'empty' | 'no-auth' | 'no-data' | 'no-target';
export type EmptySize = 's' | 'm' | 'l';

export interface EmptyProps extends AntdEmptyProps {
    imageType?: EmptyImageType;
    size?: EmptySize;
}

const IMAGE_SOURCES: Record<EmptyImageType, string> = {
    'empty-table': emptyTable,
    empty,
    'no-auth': noAuth,
    'no-data': noData,
    'no-target': noTarget,
};

const isEmptyImageType = (imageType: unknown): imageType is EmptyImageType =>
    typeof imageType === 'string' && Object.hasOwn(IMAGE_SOURCES, imageType);

const EmptyImageS = css`
    height: 110px !important;
    width: 125px !important;
    img{
        width: 100%;
    }
    flex: 0;
    margin-bottom: 4px !important;
`

const EmptyImageM = css`
    height: 154px !important;
    width: 175px !important;
    img{
        width: 100%;
    }
    flex: 0;
    margin-bottom: 12px !important;
`

const EmptyImageL = css`
    height: 218px !important;
    width: 248px !important;
    img{
        width: 100%;
    }
    flex: 0;
    margin-bottom: 12px !important;
`

const CustomEmptyRoot = css`
    display: flex;
    align-items: center;
    flex-direction: column;
`

const InternalEmpty = ({ imageType, size = 'm', image, imageStyle, styles, classNames, ...rest }: EmptyProps) => {
    const nativeImageStyle = imageStyle === undefined ? {} : { imageStyle };

    if (!isEmptyImageType(imageType)) {
        return <AntdEmpty {...rest} {...nativeImageStyle} image={image} styles={styles} />;
    }
    // 因为使用我们自定义插图时，相关样式已经确定了，所以只允许自定义外层的 root
    const computedClassNames = typeof classNames === 'function' ? classNames({props: rest}) : classNames;
    return (
        <AntdEmpty
            {...rest}
            {...nativeImageStyle}
            image={IMAGE_SOURCES[imageType]}
            classNames={{
                root: `${CustomEmptyRoot} ${computedClassNames?.root ?? ''}`,
                image: size === 's' ? EmptyImageS : size === 'l' ? EmptyImageL : EmptyImageM,

            }}
            styles={styles}
        />
    );
};

export const Empty = Object.assign(InternalEmpty, {
    PRESENTED_IMAGE_DEFAULT: AntdEmpty.PRESENTED_IMAGE_DEFAULT,
    PRESENTED_IMAGE_SIMPLE: AntdEmpty.PRESENTED_IMAGE_SIMPLE,
});
