import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import Recorder from './services/Recorder';
import Icon from './components/Icon';
import constants from './utils/constants';

import LogoAnim from './components/LogoAnim';
import NoMatch from './components/NoMatch';
import CheckerSuccess from './components/CheckerSuccess';

import './App.css';

const DEFAULT_TITLE = 'Click để kiểm tra';
const DEFAULT_DESCRIPTION = 'Đảm bảo tab đang phát nhạc và click vào biểu tượng mCheck';

let recorder;
let stepTimeout;
let childTimeout;
let childInterval;

const host = 'https://mcm.net.vn';

const App = () => {
  const windiClass = {
    content: 'app-content relative h-52',
    title: 'text-xl text-left font-bold mb-1',
    description: 'text-sm text-left opacity-60',
    action: 'app-action inline-block text-white cursor-pointer hover:opacity-81',
    bg: 'bg-cover absolute top-0 lef-0 w-full h-full object-cover'
  };

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [responseFromSocket, setResponseFromSocket] = useState({});
  const [step, setStep] = useState(constants.STEP_CHECKER.START);
  const [transitioning, setTransitioning] = useState(true);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);

  const hasNoMatch = step === constants.STEP_CHECKER.SILENCE || step === constants.STEP_CHECKER.NO_STREAM || step === constants.STEP_CHECKER.FAIL;

  const handleSuccess = (data = {}) => {
    if (data?.parent && Object.keys(data.parent)?.length > 0) {
    setStep(constants.STEP_CHECKER.RESULT);
    setResponseFromSocket(data);
    } else {
      handleFail();
    }
  };

  const handleFail = () => {
    handleNoMatch({
      step: constants.STEP_CHECKER.FAIL,
      title: 'Bản nhạc chưa được đánh dấu',
      // description: 'Bạn vui lòng sử dụng tính năng Đánh dấu bản nhạc trên website chính thức mcm.net.vn',
      description: ''
    });
  };

  const handleCancel = (params = {}) => {
    const { transitioning } = params;

    handleReset({ transitioning });

    clearTimeout(stepTimeout);
    clearTimeout(childTimeout);
    clearInterval(childInterval);

    if (recorder) {
      recorder.disconnect();
    }
  };

  const handleCheck = () => {
    if (step === constants.STEP_CHECKER.START) {
      handleSetStep(constants.STEP_CHECKER.CHECKING);

      // background
      chrome.runtime.sendMessage({ type: constants.WORKER_STATE.START }, response => {
        handleUpdateUI({
          title: 'Đang lắng nghe...',
          description: 'Vui lòng không tải lại hoặc đóng tab này'
        });
      });
    }
  };

  const handleSetStep = (step) => {
    setStep(step)
  };

  const handleReset = (params = {}) => {
    const { transitioning = false } = params;

    if (transitioning) {
      setTitle(DEFAULT_TITLE);
      setDescription(DEFAULT_DESCRIPTION)
    } else {
      titleRef.current = DEFAULT_TITLE;
      descriptionRef.current = DEFAULT_DESCRIPTION;
    }

    setTransitioning(transitioning);
    setStep(constants.STEP_CHECKER.START);
  };

  const handleAfterLeave = () => {
    setTitle(titleRef.current);
    setDescription(descriptionRef.current);
    setTransitioning(true)
  };

  const handleUpdateUI = ({ title, description }) => {
    setTransitioning(false);
    titleRef.current = title;
    descriptionRef.current = description;
  };

  const handleNoMatch = ({ step, title, description }) => {
    setTransitioning(true);
    handleSetStep(step);

    setTitle(title);
    setDescription(description);
  };

  const onRuntimeMessage = () => {
    const queryInfo = { active: true, currentWindow: true };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === constants.RECORD_STATE.START) {
        chrome.tabs.query(queryInfo, (tabs) => {
          // console.log('CAPTURING', tabs)
          const currentTab = tabs[0] || {};

          if (!currentTab.audible) {
            handleNoMatch({
              step: constants.STEP_CHECKER.SILENCE,
              title: 'Không có nhạc đang phát trong tab này',
              description: 'Đảm bảo rằng bạn đang ở tab đang phát nhạc và thử lại'
            });

            // setTimeout(() => {
            //
            // }, 1000);

            return
          }

          onAudioCapture();
        })
      }

      sendResponse()
    })
  };

  const onAudioCapture = () => {
    if (!recorder) {
      recorder = new Recorder({
        isUseUIStep: true,
        UI: {
          start: () => {

          },
          checking: () => {
            handleUpdateUI({
              title: 'Kiểm tra bản quyền...',
              description: 'Vui lòng chờ trong giây lát'
            });
          },
          success: (data) => {
            handleSuccess(data);
          },
          fail: (data) => {
            handleFail(data)
          }
        }
      });
    }

    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      // console.log('stream', stream);

      if (!stream) {
        handleNoMatch({
          step: constants.STEP_CHECKER.NO_STREAM,
          title: 'Không tìm thấy nguồn phát nhạc',
          description: 'Vui lòng bật lại ứng dụng và thử lại'
        });

        return
      }

      recorder.start({
        stream,
        isDisableMutedTab: true
      })
    })
  };

  useEffect(() => {
    onRuntimeMessage()
  }, []);

  const transitionProps = {
    appear: true,
    enter: 'transform transition duration-400',
    enterFrom: 'opacity-0 translate-y-4',
    enterTo: 'opacity-100 translate-y-0',
    leave: 'transform duration-200 transition ease-in-out',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveTo: 'opacity-0 translate-y-4'
  };

  const background = (
    <div className={windiClass.bg} style={{ backgroundImage: 'url(/assets/images/bg-mcheck.jpg)' }}/>
  );

  const renderContent = () => {
    const logoAnimProps = {};

    if (step === constants.STEP_CHECKER.CHECKING) {
      logoAnimProps.sizeClass = 'w-20 h-20';
      logoAnimProps.svgStyle = {
        width: '40px',
        height: '40px'
      };
    }

    if (step === constants.STEP_CHECKER.RESULT) {
      return (
        <div className={classNames(windiClass.content)}>
          {background}
          <CheckerSuccess
            data={responseFromSocket}
          />
        </div>
      )
    }

    if (hasNoMatch) {
      return (
        <div className={classNames(windiClass.content)}>
          {background}
          <NoMatch
            show={transitioning}
            title={title}
            description={description}
            handleRetry={handleCheck}
            handleCancel={() => {
              handleCancel({ transitioning: true });
            }}
            // isOpenWeb={step === constants.STEP_CHECKER.FAIL}
          />
        </div>
      )
    }

    return (
      <div className={classNames(windiClass.content)}>
        {background}
        <div className="relative z-1 h-52">
          <div className="flex items-center h-52">
            <div className="w-2/5">
              <LogoAnim
                logoClass="absolute"
                {...logoAnimProps}
                // animClass="w-18 h-18"
                onClick={handleCheck}
                step={step}
              />
            </div>
            <div className="relative w-3/5 pr-3">
              <Transition
                {...transitionProps}
                show={transitioning}
                afterLeave={handleAfterLeave}
              >
                <div
                  id="response"
                  className={windiClass.title}
                >
                  {title}
                </div>
                <div className={windiClass.description}>
                  {description}
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    )
  };

  const renderAction = () => {
    if (step === constants.STEP_CHECKER.RESULT) {
      return (
        <div
          className={windiClass.action}
          onClick={() => {
            handleCancel({ transitioning: true })
          }}
        >
          Xong
        </div>
      )
    }

    if (step === constants.STEP_CHECKER.CHECKING) {
      return (
        <div
          className={windiClass.action}
          onClick={handleCancel}
        >
          Dừng
        </div>
      )
    }

    return null
  };

  const renderFooter = (
    <footer className="bg-white flex items-center justify-between px-4">
      <div className="font-bold opacity-80 text-base">mCheck</div>
      <div>
        <Icon
          icon="logo-lite"
          svgStyle={{
            width: '48px',
            height: '48px'
          }}
          className="color-base cursor-pointer"
          onClick={() => {
            window.open(host)
          }}
        />
      </div>
    </footer>
  );

  return (
    <div className="app-checker">
      {renderContent()}
      <div className="absolute z-1 top-3 right-4 cursor-pointer uppercase">
        {renderAction()}
      </div>
      {renderFooter}
    </div>
  )
};

export default App
