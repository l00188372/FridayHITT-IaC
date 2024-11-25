# Terraform CDK - AWS Infrastructure Setup

This project uses the Terraform CDK (CDKTF) to define and provision an AWS infrastructure that includes multiple VPCs, subnets, security groups, route tables, internet gateways, and EC2 instances. The infrastructure is defined in TypeScript, and CDKTF is used to synthesize the configuration into Terraform code for deployment.

## Infrastructure Components

### 1. **VPCs**
   - **Bastion VPC**: A VPC with the CIDR block `10.10.1.0/24` used for the Bastion host and related resources.
   - **Production VPC**: A VPC with the CIDR block `10.10.2.0/24` used for production workloads.

### 2. **Subnets**
   - **Bastion VPC Subnets**:
     - Private subnet (`10.10.1.0/26`) in availability zone `eu-west-1a`.
     - Public subnet (`10.10.1.128/26`) in availability zone `eu-west-1a`, with public IP on launch.
   - **Production VPC Subnets**:
     - Private subnet (`10.10.2.0/26`) in availability zone `eu-west-1a`.
     - Public subnet (`10.10.2.128/26`) in availability zone `eu-west-1a`, with public IP on launch.

### 3. **Internet Gateways**
   - **Bastion Internet Gateway**: Connected to the Bastion VPC for outbound internet access.
   - **Production Internet Gateway**: Connected to the Production VPC for outbound internet access.

### 4. **Route Tables and Associations**
   - **Bastion VPC Route Tables**:
     - Private route table for the Bastion VPC.
     - Public route table for the Bastion VPC.
   - **Production VPC Route Tables**:
     - Private route table for the Production VPC.
     - Public route table for the Production VPC.
   - **Route Table Associations**:
     - Subnets are associated with the corresponding route tables for correct routing of traffic.

### 5. **VPC Peering**
   - A VPC Peering connection between the Bastion VPC and the Production VPC to allow communication between the two VPCs.

### 6. **Security Groups**
   - **Jumpbox Security Group**: A security group with rules to allow SSH access from a specific IP (`87.198.109.106/32`) and outbound traffic to any destination.

### 7. **EC2 Instance**
   - **Jumpbox EC2 Instance**: A `t2.micro` instance deployed in the Bastion VPC public subnet. It uses an AMI (`ami-0d64bb532e0502c46`) and is associated with the `Jumpbox` security group.
   - The instance's public IP is output as `JumpServerPublicIP`.

## Setup and Prerequisites

1. **Install Prerequisites**:
   - Ensure that you have Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
   - Install Terraform CDK (CDKTF) globally:
     ```bash
     npm install -g cdktf-cli
     ```

2. **Install Dependencies**:
   - Clone this repository and navigate to the project folder.
   - Install the necessary dependencies:
     ```bash
     npm install
     ```

3. **AWS Credentials**:
   - Make sure your AWS credentials are configured correctly. You can set them up by using the AWS CLI or exporting environment variables:
     ```bash
     export AWS_ACCESS_KEY_ID=<your-access-key>
     export AWS_SECRET_ACCESS_KEY=<your-secret-key>
     export AWS_DEFAULT_REGION=eu-west-1
     ```

## Deploying the Infrastructure

1. **Synthesize the Terraform Configuration**:
   - Run the following command to generate the Terraform configuration:
     ```bash
     cdktf synth
     ```

2. **Deploy the Infrastructure**:
   - After synthesizing the configuration, deploy the infrastructure to AWS using Terraform:
     ```bash
     cdktf deploy
     ```

3. **Outputs**:
   - Once the deployment is complete, the public IP of the Jumpbox EC2 instance will be displayed as an output.

## Cleanup

To destroy the infrastructure and clean up resources, run:

```bash
cdktf destroy
