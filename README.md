# MCP OIDC Validator

This tool has been made to be able to validate that MCP ID service providers live up to the OIDC token structure defined by the MCC.
The tool requires Java 17 to be installed to run.

## Generation of minimal JRE

For easy distribution of the application a minimal JRE, that only contains the required modules, can be created using `jlink`:
```bash
jlink --add-modules java.base,jdk.crypto.ec,java.logging,java.desktop,java.management,java.naming,java.security.jgss,java.instrument,java.sql --output jre --strip-debug --no-man-pages --no-header-files --compress=2
```
