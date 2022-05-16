import React from 'react';
import classNames from 'classnames';
import Icon from '../Icon';

import './styles.less';

export const RecordingAnim = ({ id, className, animClass }) => {
  const windiClass = {
    circle: 'record-btn recording-ani-2 flex items-center justify-between'
  }

  return (
    <div id={id} className={classNames('relative w-full hidden', className)}>
      <div className={classNames(windiClass.circle, 'recording-ani-1', animClass)} />
      <div className={classNames(windiClass.circle, 'recording-ani-2', animClass)} />
      <div className={classNames(windiClass.circle, 'recording-ani-3', animClass)} />
      <div className={classNames(windiClass.circle, 'recording-ani-4', animClass)} />
    </div>
  )
}

const CheckerButton = ({
  className = 'h-full',
  handleClick = () => {
  },
  idCircle = '',
  idButton = '',
  icon = 'logo-minimal',
  containerClassName,
  customSvgStyle
}) => {
  const windiClass = {}

  const startRecord = (
    <div
      id={idButton}
      className="relative w-70px h-70px mx-auto"
      onClick={handleClick}
    >
      <div
        className={classNames("absolute bg-base rounded-full p-4 w-70px h-70px transform -translate-x-1/2 -translate-y-1/2", {
          ['border border-4 border-white']: idButton === 'start-upload',
          ['!bg-white']: idButton === 'startRecord',

        })}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}
      >
        <Icon icon={icon} svgStyle={customSvgStyle ? customSvgStyle : {
          width: '36px',
          height: '36px',
        }} />
      </div>
      <RecordingAnim
        id={idCircle}
        className={className}
      />
    </div>
  )
  return (
    <div className={classNames(containerClassName)}>
      {startRecord}
    </div>
  )
}

export default CheckerButton;