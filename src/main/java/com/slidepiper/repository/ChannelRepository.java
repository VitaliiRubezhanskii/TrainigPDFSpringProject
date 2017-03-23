package com.slidepiper.repository;

import com.slidepiper.model.entity.Channel;
import org.springframework.data.repository.Repository;

public interface ChannelRepository extends Repository<Channel, Long> {
    Channel findByFriendlyId(String friendlyId);
}
