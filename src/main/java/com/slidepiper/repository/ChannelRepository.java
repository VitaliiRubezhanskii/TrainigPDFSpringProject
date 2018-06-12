package com.slidepiper.repository;

import com.slidepiper.model.entity.Channel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

public interface ChannelRepository extends Repository<Channel, Long> {
    Channel findByFriendlyId(String friendlyId);



}