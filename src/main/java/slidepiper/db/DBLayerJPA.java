package slidepiper.db;

import com.slidepiper.model.entity.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class DBLayerJPA implements DBLayerService {


    @Autowired
    private DBLayerRepository dbLayerRepository;


    @Override
    public void deleteCustomer(Customer customer) {
      //  Customer deleteCustomer=getCustomerByEmail(customer.getEmail());
        dbLayerRepository.delete(customer);
    }



    @Override
    public void addNewCustomer(Customer customer) {
        dbLayerRepository.save(customer);
    }

    @Override
    public String getCustomerName(Customer customer) {
        return null;
    }

    @Override
    public Customer getCustomerByEmail(String email, String username) {
        return dbLayerRepository.getCustomerByEmail(email);
    }

    @Override
    public boolean isCustomerExist(Customer customer) {
        return false;
    }

    @Override
    public boolean isCustomerIDExist(Customer customer) {
        return false;
    }

    @Override
    public boolean isCustomerIDTakenByAnotherUser(Customer customer) {
        return false;
    }


}
