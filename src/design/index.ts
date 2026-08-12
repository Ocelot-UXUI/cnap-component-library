/**
 * 设计系统统一出口。
 *
 * 项目内所有基础组件、antd 工具与类型都从这里引入，禁止业务代码直接从 'antd' 导入
 * （约束见 docs/context/conventions.md 与 .eslintrc.cjs 的 no-restricted-imports）。
 *
 * - 自定义 / 增强组件：从各自目录导出（Drawer、Select 等）。
 * - 透传组件：从同名子目录再导出 antd 原组件（Button、Input、Table 等）。
 * - 工具与类型：直接从 antd 再导出，收敛类型出口。
 */

// 自定义 / 增强组件
export {Drawer} from './Drawer';
export type {DrawerProps, DrawerSize} from './Drawer';
export {Modal} from './Modal';
export type {ModalProps, ModalSize} from './Modal';
export {Select} from './Select';

// 透传组件（各自子目录）
export {Alert} from './Alert';
export {Avatar} from './Avatar';
export {Badge} from './Badge';
export {Breadcrumb} from './Breadcrumb';
export {Button} from './Button';
export {Card} from './Card';
export {Checkbox} from './Checkbox';
export {Col} from './Col';
export {Collapse} from './Collapse';
export {ConfigProvider} from './ConfigProvider';
export {DatePicker} from './DatePicker';
export {Descriptions} from './Descriptions';
export {Divider} from './Divider';
export {Dropdown} from './Dropdown';
export {Empty} from './Empty';
export {Flex} from './Flex';
export {Form} from './Form';
export {Input} from './Input';
export {InputNumber} from './InputNumber';
export {Layout} from './Layout';
export {List} from './List';
export {Menu} from './Menu';
export {Pagination} from './Pagination';
export {Popover} from './Popover';
export {Progress} from './Progress';
export {Radio} from './Radio';
export {Result} from './Result';
export {Row} from './Row';
export {Segmented} from './Segmented';
export {Slider} from './Slider';
export {Space} from './Space';
export {Spin} from './Spin';
export {Statistic} from './Statistic';
export {Switch} from './Switch';
export {Table} from './Table';
export {Tabs} from './Tabs';
export {Tag} from './Tag';
export {Timeline} from './Timeline';
export {Tooltip} from './Tooltip';
export {Typography} from './Typography';

// antd 工具（非组件）
export {message, notification, theme} from 'antd';

// 类型出口（收敛业务侧对 antd 类型的引用）
export type {
    ButtonProps,
    DropdownProps,
    FormItemProps,
    FormProps,
    MenuProps,
    ResultProps,
    SelectProps,
    SwitchProps,
    TableColumnsType,
    TablePaginationConfig,
    TableProps,
    TabsProps,
    ThemeConfig,
    TooltipProps,
} from 'antd';
export type {ColumnsType} from 'antd/es/table';
export type {SorterResult, TableCurrentDataSource} from 'antd/es/table/interface';
export type {FormInstance, Rule} from 'antd/es/form';
export type {InputProps, PasswordProps} from 'antd/es/input';
