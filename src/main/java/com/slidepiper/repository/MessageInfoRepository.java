package com.slidepiper.repository;

import com.slidepiper.model.entity.MessageInfo;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository
public interface MessageInfoRepository extends Repository<MessageInfo,Integer> {

    @Query("select m from MessageInfo  m where m.id=:id")
    MessageInfo getMessageInfoById(@Param("id") String id);

}
