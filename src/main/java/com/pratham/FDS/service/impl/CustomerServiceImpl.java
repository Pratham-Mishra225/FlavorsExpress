package com.pratham.FDS.service.impl;

import com.pratham.FDS.dto.CustomerDTO;
import com.pratham.FDS.entity.Customer;
import com.pratham.FDS.exception.EmailAlreadyExistsException;
import com.pratham.FDS.exception.ResourceNotFoundException;
import com.pratham.FDS.mapper.CustomerMapper;
import com.pratham.FDS.repository.CustomerRepository;
import com.pratham.FDS.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public CustomerDTO createCustomer(CustomerDTO customerDTO) {
        log.info("Creating customer with email: {}", customerDTO.getEmail());
        if (customerRepository.existsByEmail(customerDTO.getEmail())) {
            throw new EmailAlreadyExistsException(customerDTO.getEmail());
        }
        Customer customer = customerMapper.toEntity(customerDTO);
        if (customer.getPassword() == null || customer.getPassword().trim().isEmpty()) {
            customer.setPassword(passwordEncoder.encode("CustomerPass123!"));
        } else {
            customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        }
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer created successfully with ID: {}", savedCustomer.getId());
        return customerMapper.toDTO(savedCustomer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        log.info("Fetching customer with ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return customerMapper.toDTO(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        log.info("Fetching all customers");
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        log.info("Updating customer with ID: {}", id);
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        // Check email uniqueness only if it's being changed
        if (!existingCustomer.getEmail().equalsIgnoreCase(customerDTO.getEmail())
                && customerRepository.existsByEmail(customerDTO.getEmail())) {
            throw new EmailAlreadyExistsException(customerDTO.getEmail());
        }

        existingCustomer.setName(customerDTO.getName());
        existingCustomer.setEmail(customerDTO.getEmail());
        existingCustomer.setPhone(customerDTO.getPhone());
        existingCustomer.setRole(customerDTO.getRole());

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        log.info("Customer updated successfully with ID: {}", updatedCustomer.getId());
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public void deleteCustomer(Long id) {
        log.info("Deleting customer with ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.delete(customer);
        log.info("Customer deleted successfully with ID: {}", id);
    }
}
