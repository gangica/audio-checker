import React from 'react';
import { Transition } from '@headlessui/react';
import Icon from '../Icon';
import Button from '../Button';

const NoMatch = ({
  icon,
  title,
  description,
  handleRetry,
  handleCancel,
  show,
  afterLeave,
  isRetry,
  isOpenWeb
}) => {
  const windiClass = {
    content: 'h-52 flex items-center justify-center text-center',
    title: 'text-lg font-bold',
    description: 'text-sm opacity-70 mt-1',
    action: 'flex space-x-3 absolute w-full bottom-4 justify-center px-4'
  };

  const transitionProps = {
    appear: true,
    enter: 'transform transition duration-400',
    enterFrom: 'opacity-0 translate-y-4',
    enterTo: 'opacity-100 translate-y-0',
    leave: 'transform duration-200 transition ease-in-out',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveTo: 'opacity-0 translate-y-4'
  };

  return (
    <Transition
      {...transitionProps}
      show={show}
      afterLeave={afterLeave}
      className="relative z-1"
    >
      <div className={windiClass.content}>
        <div className="pb-8 px-4">
          {
            icon
            &&
            <div>
              <Icon
                icon={icon}
              />
            </div>
          }
          <div className={windiClass.title}>
            {title}
          </div>
          {
            description
            &&
            <div className={windiClass.description}>
              {description}
            </div>
          }
        </div>
      </div>
      <div className={windiClass.action}>
        <Button
          size="small"
          onClick={handleCancel}
          className="w-1/2 bg-cancel uppercase !py-2"
        >
          Bỏ qua
        </Button>
        {
          isRetry
          &&
          <Button
            size="small"
            active
            onClick={handleRetry}
            className="w-1/2 !py-2 !bg-base uppercase"
          >
            Thử lại
          </Button>
        }
        {
          isOpenWeb
          &&
          <Button
            size="small"
            active
            onClick={() => {
              window.open('https://mcm.net.vn?isOpenWatermark=true')
            }}
            className="w-1/2 !py-2 !bg-base uppercase"
          >
            Truy cập
          </Button>
        }
      </div>
    </Transition>
  )
};

export default NoMatch
