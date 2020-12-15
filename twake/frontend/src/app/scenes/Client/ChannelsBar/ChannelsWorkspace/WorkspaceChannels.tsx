import React from 'react';

import { ChannelResource } from 'app/models/Channel';

import Languages from 'services/languages/languages.js';
import ModalManager from 'app/components/Modal/ModalManager';
import { Collection } from 'services/CollectionsReact/Collections';

import ChannelCategory from '../Parts/Channel/ChannelCategory';
import ChannelIntermediate from '../Parts/Channel/ChannelIntermediate';

import ChannelWorkspaceEditor from 'scenes/Client/ChannelsBar/Modals/ChannelWorkspaceEditor';
import WorkspaceChannelList from 'scenes/Client/ChannelsBar/Modals/WorkspaceChannelList';

import Menu from 'components/Menus/Menu.js';
import Icon from 'components/Icon/Icon';

type Props = {
  collection: Collection<ChannelResource>;
  workspaceTitle: string;
  channels: ChannelResource[];
  favorite?: boolean;
};

export default (props: Props) => {
  const addChannel = () => {
    return ModalManager.open(
      <ChannelWorkspaceEditor title={'scenes.app.channelsbar.channelsworkspace.create_channel'} />,
      {
        position: 'center',
        size: { width: '600px' },
      },
    );
  };

  const joinChannel = () => {
    return ModalManager.open(<WorkspaceChannelList />, {
      position: 'center',
      size: { width: '500px' },
    });
  };

  let channels;

  if (props.channels.length === 0) {
    channels = (
      <div className="channel_small_text">
        {Languages.t('scenes.app.channelsbar.channelsworkspace.no_channel')}
      </div>
    );
  } else {
    channels = props.channels.map(({ data, key }) => {
      return (
        <ChannelIntermediate key={key} collection={props.collection} channelId={data.id || ''} />
      );
    });
  }
  return (
    <>
      <ChannelCategory
        text={Languages.t(props.workspaceTitle)}
        suffix={
          !props.favorite && (
            <Menu
              className="add"
              menu={[
                {
                  type: 'menu1',
                  text: Languages.t('components.leftbar.channel.workspaceschannels.menu.option_1'),
                  onClick: () => addChannel(),
                },
                {
                  type: 'menu2',
                  text: Languages.t('components.leftbar.channel.workspaceschannels.menu.option_2'),
                  onClick: () => joinChannel(),
                },
              ]}
            >
              <Icon type="plus-circle" className="m-icon-small" />
            </Menu>
          )
        }
      />
      {channels}
    </>
  );
};