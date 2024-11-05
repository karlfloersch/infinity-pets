import re
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')

def generate_interfaces(solidity_file_path):
    logging.info(f"Reading Solidity file: {solidity_file_path}")
    with open(solidity_file_path, 'r') as file:
        content = file.read()

    # Improved regex to capture contracts with inheritance or modifiers
    contract_pattern = re.compile(r'contract\s+(\w+)\s*(?:is\s+[\w, ]+)?\s*{')
    contracts = contract_pattern.findall(content)
    logging.debug(f"Found contracts: {contracts}")

    # Find all async functions
    async_function_pattern = re.compile(r'function\s+(\w+)\s*\((.*?)\)\s*external\s+async\s*returns\s*\((.*?)\)')
    async_functions = async_function_pattern.findall(content)
    logging.debug(f"Found async functions: {async_functions}")

    # Generate promise interfaces
    promise_interfaces = []
    for func_name, _, return_type in async_functions:
        promise_interface = f"""
interface {func_name}Promise {{
    function then(function({return_type}) external) external;
}}
"""
        promise_interfaces.append(promise_interface)
        logging.debug(f"Generated promise interface for function: {func_name}")

    # Generate remote interfaces
    remote_interfaces = []
    for contract_name in contracts:
        remote_interface = f"interface Remote{contract_name} {{\n"
        for func_name, params, _ in async_functions:
            remote_interface += f"    function {func_name}({params}) external returns ({func_name}Promise);\n"
        remote_interface += "}\n"
        remote_interfaces.append(remote_interface)
        logging.debug(f"Generated remote interface for contract: {contract_name}")

    # Output the generated interfaces
    output_dir = os.path.dirname(solidity_file_path)
    output_file_path = os.path.join(output_dir, 'GeneratedInterfaces.sol')
    logging.info(f"Writing generated interfaces to: {output_file_path}")
    with open(output_file_path, 'w') as output_file:
        for promise_interface in promise_interfaces:
            output_file.write(promise_interface)
        for remote_interface in remote_interfaces:
            output_file.write(remote_interface)

# Example usage
generate_interfaces('src/MyAsyncContractTest.sol')