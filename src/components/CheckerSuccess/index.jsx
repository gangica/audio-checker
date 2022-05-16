import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
// import Image from '../Image';
import Icon from '../Icon';

const CheckerSuccess = ({ data = {} }) => {
  const windiClass = {
    box: 'relative z-1 h-52',
    content: 'flex item-center p-4',
    info: '',
    title: 'text-xl font-bold mb-1',
    meta: 'text-sm opacity-63',
    bottom: 'flex items-center absolute bottom-0 w-full px-4 py-2 whitespace-nowrap',
    logo: 'absolute top-2 left-2 opacity-30'
  };

  const [infoAnim, setInfoAnim] = useState(true);
  const [contentAnim, setContentAnim] = useState(false);

  const { parent = {} } = data;

  const {
    title = 'Đang cập nhật',
    artist = 'Đang cập nhật',
    composer,
    authorRight,
    publisher,
    image,
    phone,
    email
  } = parent;

  const transitionInfoProps = {
    appear: true,
    enter: 'transform transition duration-400',
    enterFrom: 'opacity-0 translate-y-4',
    enterTo: 'opacity-100 translate-y-0',
    leave: 'transform duration-200 transition ease-in-out',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveTo: 'opacity-0 -translate-y-4'
  };

  const transitionContentProps = {
    appear: true,
    enter: 'transform transition duration-400',
    enterFrom: 'opacity-0 scale-96',
    enterTo: 'opacity-100 scale-100',
    leave: 'transform duration-200 transition ease-in-out',
    leaveFrom: 'opacity-100',
    leaveTo: 'opacity-0'
  };

  const metas = [
    {
      title: 'Tác quyền',
      value: authorRight
    },
    {
      title: 'Thể hiện',
      value: artist
    },
    {
      title: 'Sáng tác',
      value: composer
    },
    {
      title: 'Xuất bản',
      value: publisher
    }
  ];

  const contacts = [
    {
      icon: 'phone-circle',
      value: phone,
      isPhone: true
    },
    {
      icon: 'mail-circle',
      value: email,
      isEmail: true
    }
  ];

  const info = (
    <div className={windiClass.info}>
      <div className={classNames(windiClass.title, 'line-clamp-2 pr-15')}>{title}</div>
      <div className="mt-2 space-y-0.5">
        {
          metas.map(({ title, value }) => {
            return (
              <div className="flex">
                <div className="opacity-70 w-20">{title}</div>
                <div className="line-clamp-1">{value || 'Chưa có thông tin'}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  );

  useEffect(() => {
    const actionEle = document.getElementsByClassName('app-action')[0];

    if (actionEle) {
      actionEle.style.display = 'none'
    }

    setTimeout(() => {
      setInfoAnim(false);
    }, 1500)
  }, []);

  return (
    <div className={windiClass.box}>
      <Transition
        show={infoAnim}
        {...transitionInfoProps}
        className="h-52 p-4 flex items-center justify-center text-center"
        afterLeave={() => {
          if (!infoAnim) {
            const actionEle = document.getElementsByClassName('app-action')[0];

            if (actionEle) {
              actionEle.style.display = 'inline-block'
            }

            setContentAnim(true);
          }
        }}
      >
        <div className={windiClass.info}>
          <div className={windiClass.title}>{title}</div>
          <div className={windiClass.meta}>{artist}</div>
        </div>
      </Transition>
      <Transition
        show={contentAnim}
        {...transitionContentProps}
        className={windiClass.content}
      >
        <div className="mr-4 w-32 rounded-xl bg-white flex items-center">
          <img
            src={image}
            className="rounded-xl image object-cover absolute relative"
          >
          </img>
          {/* <Image
            isScale
            isSquare
            imgClassName="rounded-6px absolute inset-0 w-full h-full"
            src={image}
            className="rounded-12px image object-cover absolute w-30 h-30 relative"
            overlayText={(
              <>
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30"/>
                <div className={windiClass.logo}>
                  <Image
                    src="/assets/images/logo-watermark.png"
                    className="w-32px h-32px"
                  />
                </div>
              </>
            )}
          /> */}
        </div>
        <div className="flex items-center text-left">
          {info}
        </div>
      </Transition>
      {
        contentAnim
        &&
        <div className={windiClass.bottom}>
          <div>
            Liên hệ mua bản quyền:
          </div>
          <div className="ml-auto w-3/5 flex items-center justify-end">
            {
              contacts.map(({ icon, value, isPhone, isEmail }) => {
                return (
                  <div
                    className={classNames('inline-block align-middle w-1/2 line-clamp-1 pl-2', {
                      ['cursor-pointer']: value
                    })}
                    onClick={() => {
                      let title = 'Sao chép thành công!';

                      if (isPhone) {
                        title = 'Sao chép số điện thoại thành công!'
                      }

                      if (isEmail) {
                        title = 'Sao chép email thành công!'
                      }

                      // if (value) {
                      //   copyToClipboard({
                      //     text: value,
                      //     onCopy: () => {
                      //       messageHandler({
                      //         title,
                      //         isClose: false,
                      //         contentClass: '!bg-white',
                      //         titleClass: '!text-black',
                      //         transitionClass: '!translate-y-1'
                      //       })
                      //     }
                      //   })
                      // }
                    }}
                  >
                    <Icon icon={icon} className="mr-1 !align-text-top"/>
                    <span title={value}>{value || 'Đang cập nhật'}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
      }
    </div>
  )
};

export default CheckerSuccess
