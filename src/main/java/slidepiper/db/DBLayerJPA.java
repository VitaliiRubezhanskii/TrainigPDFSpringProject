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
        dbLayerRepository.delete(customer);
    }

    @Override
    public int addNewCustomer(Customer customer) {
        dbLayerRepository.save(customer);
        return 0;
    }

    @Override
    public String getCustomerName(Customer customer) {
        return null;
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

    @Override
    public Customer getCustomerByEmail(String email) {
        return dbLayerRepository.getCustomerByEmail(email);
    }
}
