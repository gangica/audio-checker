import React from 'react';
import classNames from 'classnames';
import { RecordingAnim } from '../CheckerButton';
import Icon from '../Icon';
import constants from '../../utils/constants';

const LogoAnim = ({
  sizeClass = 'w-20 h-20',
  logoClass,
  svgStyle = {
    width: '56px',
    height: '56px'
  },
  onClick,
  step,
  animClass
}) => {
  return (
    <div className={classNames('app-logo-anim mx-auto', sizeClass)}>
      <div
        className={classNames('app-logo bg-white rounded-full flex items-center justify-center cursor-pointer', logoClass, sizeClass)}
        onClick={onClick}
      >
        <Icon
          icon="checker-record"
          svgStyle={svgStyle}
          className="color-base"
        />
      </div>
      {
        step === constants.STEP_CHECKER.CHECKING
        &&
        <RecordingAnim
          className="!block h-20"
          animClass={classNames('!bg-white !bg-opacity-40', animClass)}
        />
      }
    </div>
  )
};

export default LogoAnim
