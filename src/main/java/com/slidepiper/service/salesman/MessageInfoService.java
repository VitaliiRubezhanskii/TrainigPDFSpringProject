package com.slidepiper.service.salesman;

import com.slidepiper.model.entity.MessageInfo;
import com.slidepiper.repository.MessageInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
public class MessageInfoService {

    @Autowired
    private MessageInfoRepository messageInfoRepository;

    public MessageInfo getSalesManEmailByMessageInfoId(String id){
        return messageInfoRepository.getMessageInfoById(id);
    }

}
