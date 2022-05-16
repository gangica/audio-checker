import React, { useRef, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { usePlatform } from '../../../context/platform';
import useInView from '../../../hooks/useInView';
import usePlayer from '../../../hooks/usePlayer';
import useReRender from '../../../hooks/useReRender';
import config from '../../../utils/config';

import Icon from '../Icon';
import ContextMenu from '../ContextMenu';
import GridThumbnail from '../GridThumbnail';

import './styles.less';

const checkImageComplete = (img) => {
  if (!img) {
    return false
  }

  return !!(img.complete && typeof img.naturalWidth !== 'undefined' && img.naturalWidth > 1);
};

const defaultUrl = `${config.cdnUrl}/assets/images/thumbnail-default.png`;

let intervalCheckImage;

const Image = ({
  prefixCls = 'app-image',
  className,
  imgClassName,
  responsive,
  background,
  src,
  isZoom,
  alt,
  isVideo,
  bordered,
  height,
  ratio,
  isCircle,
  isSquare,
  isScale,
  isCenter,
  isLite,
  isFull,
  isAddItem,
  customOnClick,
  hasOverlay,
  overlayText,
  notOverlayMobile,
  overlayAction,
  contextMenu,
  thumbnails,
  placeholder,
  playIconRef,
  overlayClick,
  isPlayed,
  isPlaying,
  isPersonal,
  isInQueue,
  record,
  ...restProps
}) => {
  const { platform } = usePlatform();
  const player = usePlayer();
  const imageRef = useRef();
  const checkLoadedRef = useRef(false);
  const reRender = useReRender(false);

  const windiClass = {
    box: 'overflow-hidden',
    img: 'block transform object-cover rounded-thumbnail',
    playVideoIcon: 'absolute z-1 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 leading-0',
    overlay: classNames('w-full absolute h-full transition-all duration-200 top-0 left-0 rounded-thumbnail bg-black', {
      ['opacity-0 group-hover:opacity-40']: platform.isDesktop,
      ['opacity-40']: platform.isMobile,
    }),
    overlayIcon: classNames('app-overlay-icon', 'absolute right-3 bottom-0 opacity-0 leading-0 group-hover:opacity-100 transition-all duration-300', {
      ['group-hover:bottom-3']: !isCenter,
      ['isCenter bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2']: isCenter,
      ['!opacity-100 !bottom-3']: (platform.isMobile || isPlaying) && !isCenter,
      ['!opacity-100 !bottom-1/2']: (platform.isMobile || isPlaying) && isCenter,
      // ['!hidden']: platform.isMobile && isCenter,
      ['flex items-center justify-center']: overlayAction
    }),
    playIcon: classNames('play-icon rounded-full p-8px leading-0 transition-all duration-300 transform hover:scale-110 z-2', {
      ['bg-base']: platform.isDesktop || (platform.isMobile && !isCenter),
      ['p-10px']: isCenter && !isLite,
    }),
    playingIcon: classNames('playing-icon hidden rounded-full p-8px leading-0 transition-all duration-300 transform hover:scale-110', {
      ['bg-base']: platform.isDesktop || (platform.isMobile && !isCenter)
    }),
    addContainer: 'flex items-center justify-center h-full w-full absolute',
    addPlus: 'text-base-4xl mb-3 sm:(text-4xl mt-3)'
  };

  const { ref, isIntersecting } = useInView({
    triggerOnce: true
  });

  let initialSrc = null;

  if (!placeholder) {
    placeholder = defaultUrl
  }

  const hasLoaded = isIntersecting && src;

  if (import.meta.env.SSR) {
    initialSrc = src;
  } else {
    if (isIntersecting && src && !checkLoadedRef.current) {
      initialSrc = src;
    } else {
      initialSrc = placeholder
    }
  }

  if (isCircle) {
    isSquare = true
  }

  let width;

  if (ratio && height) {
    width = ratio * height
  }

  const onLoad = (event) => {
    // event.target.classList.add('loaded');
    if (checkLoadedRef.current) {
      checkLoadedRef.current = false;
      reRender();
    }
  };

  const onError = (event) => {
    event.target.classList.add('has-error');

    event.target.src = placeholder;
  };

  useLayoutEffect(() => {
    if (checkLoadedRef.current) {
      if (imageRef.current && checkImageComplete(imageRef.current)) {
        checkLoadedRef.current = false;

        reRender();
      }
    }
  }, [imageRef.current, checkLoadedRef.current]);

  useLayoutEffect(() => {
    return () => {
      if (src) {
        checkLoadedRef.current = true;
      }
    }
  }, [src]);

  const imgProps = {
    src: initialSrc,
    onLoad,
    onError
  };

  const overlayIconSvgStyle = {};

  if (isCenter && !isLite) {
    overlayIconSvgStyle.width = '26px';
    overlayIconSvgStyle.height = '26px';
  }

  const renderImg = () => {
    if (isAddItem) {
      return (
        <div className={windiClass.addContainer} onClick={customOnClick}>
          <Icon icon="plus" className="app-large-icon"/>
        </div>
      )
    }

    if (thumbnails?.length > 0) {
      return (
        <GridThumbnail
          size={2}
          thumbnails={thumbnails}
          className={classNames({
            ['transform group-hover:scale-110 transition-hover duration-600']: isScale,
          })}
        />
      )
    }

    return (
      <img
        ref={imageRef}
        className={classNames(windiClass.img, imgClassName, {
          ['absolute inset-0 w-full h-full br-base']: responsive || height,
          ['rounded-thumbnail']: bordered && !isCircle,
          ['!rounded-full']: isCircle,
          ['transform group-hover:scale-110 transition-hover duration-600']: isScale && !platform.isSafari,
          ['w-full h-full']: isFull
        })}
        alt={alt}
        {...imgProps}
      />
    )
  };

  const handlePlayPersonalPlaylist = (e) => {
    const handlePlay = restProps.handlePlay;

    if (isPersonal) {
      if (isPlaying) {
        e.stopPropagation();
        player.playToggle();
        return
      }

      return handlePlay(e, {
        isPlayNow: true,
        isResetQueue: true,
        isPersonal: true,
        // isPlayed: true,
        isStopPropagation: true
      })
    }
  };

  const renderPlaying = () => {
    if (isInQueue && platform.isMobile) return;

    return (
      <div className={windiClass.playingIcon} onClick={e => handlePlayPersonalPlaylist(e)}>
        <span className={classNames("inline-block", {
          ['w-16px h-16px']: !overlayAction,
          ['w-28px h-28px']: overlayAction,
          ['w-26px h-26px']: isCenter && !isLite
        })}>
          <img src={`${config.cdnUrl}/assets/icons/playing64.gif`} alt="playing-gif"/>
        </span>
      </div>
    )
  };

  if (platform.isMobile) {
    if (isCenter && !isPlayed || !isCenter || (isInQueue && isPlaying)) {
      hasOverlay = false
    }
  }

  return (
    <div
      ref={ref}
      className={classNames(prefixCls, windiClass.box, className, {
        ['relative']: responsive || height,
        ['!bg-base']: isAddItem,
        ['pb-9/16 w-full h-0']: responsive && !height && !thumbnails,
        ['pl-16/9 w-0']: responsive && height,
        ['rounded-thumbnail']: bordered && !isCircle,
        ['!rounded-full']: isCircle,
        ['!pb-1/1']: (isSquare && !thumbnails) || thumbnails?.length === 0,
        ['h-full']: isFull
      })}
      {...restProps}
      style={{
        height,
        width
      }}
    >
      {renderImg()}
      {overlayText && overlayText}
      {
        platform.isDesktop
        &&
        <div className={windiClass.overlay}/>
      }
      {
        hasOverlay
        &&
        <>
          {
            platform.isMobile
            &&
            <div className={windiClass.overlay}/>
          }
          <div
            className={windiClass.overlayIcon}
            ref={playIconRef}
            onClick={overlayClick}
          >
            {
              overlayAction
              &&
              <Icon
                icon={overlayAction.left.icon}
                className={overlayAction.left.className}
                onClick={overlayAction.left.onClick}
              />
            }
            <Icon
              className={windiClass.playIcon}
              icon="play"
              svgStyle={overlayIconSvgStyle}
              onClick={e => handlePlayPersonalPlaylist(e)}
            />
            {renderPlaying()}
            {
              overlayAction
              &&
              <ContextMenu
                trigger={['click']}
                hideOnClick={true}
                className="min-w-70"
                contextMenu={contextMenu}
              >
                <Icon
                  icon={overlayAction.right.icon}
                  className={overlayAction.right.className}
                  onClick={overlayAction.right.onClick}
                />
              </ContextMenu>
            }
          </div>
        </>
      }
      {
        isVideo
        &&
        <div className={windiClass.playVideoIcon}>
          <Icon
            icon="video-play"
          />
        </div>
      }
    </div>
  )
};

export default Image
