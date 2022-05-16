import React from 'react';
import classNames from 'classnames';
// import _debounce from 'lodash/debounce';
// import { usePlatform } from '../../../context/platform';
import Icon from '../Icon'

import './styles.less';

const Button = ({
  prefixCls,
  className,
  text,
  children,
  active,
  icon,
  suffixIcon,
  suffixClass,
  size,
  onClick = () => {},
  isDebounce = true,
  isLeft,
  isRight,
  isCircle,
  isFull,
  isBordered,
  iconClass,
  ...buttonProps
}) => {
  // const { platform } = usePlatform();

  const windiClass = 'inline-block px-3 py-2 rounded-btn text-base appearance-none focus:outline-none';

  let handleClick = onClick;

  // if (isDebounce) {
  //   handleClick = _debounce(() => onClick(), 200);
  // }

  return (
    <button
      className={classNames(prefixCls, windiClass, className, {
        ['bg-base hover:bg-opacity-90 text-white bc-base hover:bc-hover-base hover:text-white']: active,
        ['bg-deactive text-white-50']: !active && !isBordered,
        ['inline-flex items-center']: icon,
        ['px-2 py-0 !text-sm leading-6 min-h-btn sm:px-1']: size === 'small',
        ['!rounded-full']: isCircle,
        ['btn-left']: isLeft,
        ['btn-right']: isRight,
        ['w-full']: isFull,
        ['rounded-btn border-1 border-white border-opacity-30']: isBordered,
        ['hover:bc-base hover:tc-base']: isBordered && !active,
      })}
      onClick={handleClick}
      {...buttonProps}
    >
      {
        icon
        &&
        <Icon
          icon={icon}
          className={classNames(iconClass, {
            ['mr-1']: text || children
          })}
        />
      }
      {text || children}
      {
        suffixIcon
        &&
        <Icon
          icon={suffixIcon}
          className={classNames('ml-1', suffixClass)}
        />
      }
    </button>
  )
};

export default Button
