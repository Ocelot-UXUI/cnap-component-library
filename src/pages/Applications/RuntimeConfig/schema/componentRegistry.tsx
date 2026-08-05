import {Checkbox, Input, InputNumber, Radio, Select, Slider, Switch} from '@/design';
import React from 'react';
import {ConfigReferenceList} from '../components/ConfigReferenceList';
import {ContainerList} from '../components/ContainerList';
import {EnvList} from '../components/EnvList';
import {KeyValueList} from '../components/KeyValueList';
import {MountVolumeList} from '../components/MountVolumeList';
import {PortList} from '../components/PortList';
import {ProbeConfig} from '../components/ProbeConfig';
import {ResourceLimit} from '../components/ResourceLimit';
import type {ComponentType} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

export const componentRegistry: Record<ComponentType, AnyComponent> = {
    Input,
    InputNumber,
    Select,
    Switch,
    Slider,
    Radio: Radio.Group,
    Checkbox: Checkbox.Group,
    TextArea: Input.TextArea,
    PortList,
    EnvList,
    ProbeConfig,
    ResourceLimit,
    KeyValueList,
    ContainerList,
    MountVolumeList,
    ConfigReferenceList,
};
