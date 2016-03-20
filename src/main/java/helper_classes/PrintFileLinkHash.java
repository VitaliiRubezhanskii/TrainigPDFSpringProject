package helper_classes;

import org.hashids.Hashids;

import slidepiper.config.ConfigProperties;

public class PrintFileLinkHash {

  /**
   * Print a file link hash similar to the DbLayer.setFileLinkHash generated hash and 
   * file link creation. 
   */
  public static void main(String[] args) {
    
     // msgInfoAiId is msg_info table id_ai field auto increment expected value. It is better to first 
     // insert a record to the msg_info table, and the get the exact value of ai_id.
    long msgInfoAiId = 0;
    
    Hashids hashids = new Hashids(ConfigProperties.getProperty("hashids_salt"), 
        Integer.parseInt(ConfigProperties.getProperty("hashids_minimum_file_link_hash_length")),
        ConfigProperties.getProperty("hashids_custom_hash_alphabet")); 
    
    String fileLinkHash = hashids.encode(msgInfoAiId);
    System.out.println(fileLinkHash);
  }
}
