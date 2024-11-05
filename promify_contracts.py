import re
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')

def generate_interfaces(solidity_file_path, output_base_dir):
    if not solidity_file_path.is_file():
        logging.warning(f"Skipping non-file path: {solidity_file_path}")
        return

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

    # If no async functions are found, skip file generation
    if not async_functions:
        logging.info(f"No async functions found in {solidity_file_path}. Skipping file generation.")
        return

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

    # Determine output file path
    relative_path = Path(solidity_file_path).relative_to('src')
    output_file_path = output_base_dir / relative_path.with_name(f"Remote{relative_path.stem}.sol")
    output_file_path.parent.mkdir(parents=True, exist_ok=True)

    # Output the generated interfaces
    logging.info(f"Writing generated interfaces to: {output_file_path}")
    with open(output_file_path, 'w') as output_file:
        for promise_interface in promise_interfaces:
            output_file.write(promise_interface)
        for remote_interface in remote_interfaces:
            output_file.write(remote_interface)

    # Add import statement to the original Solidity file if not already present
    depth = len(relative_path.parts)
    import_path = "../" * depth + str(output_file_path.relative_to(output_base_dir.parent))
    for contract_name in contracts:
        # Collect all promise interface names
        promise_interface_names = ', '.join(f"{func_name}Promise" for func_name, _, _ in async_functions)
        import_statement = f'import {{Remote{contract_name}, {promise_interface_names}}} from "{import_path}";\n'
        if import_statement not in content:
            logging.info(f"Adding import statement to {solidity_file_path}")
            # Find the end of the pragma line
            pragma_index = content.find('pragma')
            if pragma_index != -1:
                pragma_end = content.find('\n', pragma_index) + 1
                updated_content = content[:pragma_end] + import_statement + content[pragma_end:]
                with open(solidity_file_path, 'w') as file:
                    file.write(updated_content)

# Process all .sol files in the ./src directory
src_dir = Path('src')
output_base_dir = Path('build_promise')
for solidity_file in src_dir.rglob('*.sol'):
    generate_interfaces(solidity_file, output_base_dir)