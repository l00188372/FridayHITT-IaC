import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { Vpc } from "@cdktf/provider-aws/lib/vpc";
import { Subnet } from "@cdktf/provider-aws/lib/subnet";
import { RouteTable } from "@cdktf/provider-aws/lib/route-table";
import { RouteTableAssociation  } from "@cdktf/provider-aws/lib/route-table-association";
import { VpcPeeringConnection } from "@cdktf/provider-aws/lib/vpc-peering-connection";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { SecurityGroupRule } from "@cdktf/provider-aws/lib/security-group-rule";
import { InternetGateway } from "@cdktf/provider-aws/lib/internet-gateway";
import { InternetGatewayAttachment } from "@cdktf/provider-aws/lib/internet-gateway-attachment";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";




class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Add the AWS provider
    new AwsProvider(this, "Aws", {
      region: "eu-west-1", // Specify your desired AWS region
    });

    // VPCs
    const bstVpc = new Vpc(this, 'BstEuVPC', {
      cidrBlock: '10.10.1.0/24',
      enableDnsSupport: true,
      enableDnsHostnames: true,
      tags: { Name: 'fh-eu-bst' }
    });

    const prodVpc = new Vpc(this, 'ProdEuVPC', {
      cidrBlock: '10.10.2.0/24',
      enableDnsSupport: true,
      enableDnsHostnames: true,
      tags: { Name: 'fh-eu-prod' }
    });
    

    // Subnets
    const subnets = {

      bastionPrivate1a: new Subnet(this, 'BastionPrivateSubnet1a', {
        vpcId: bstVpc.id,
        cidrBlock: '10.10.1.0/26',
        availabilityZone: 'eu-west-1a',
        tags: { Name: 'fh-bst-private1-subnet-eu-west-1a', stack: 'bastian' }
      }),
      bastionPublic1a: new Subnet(this, 'BastionPublicSubnet1a', {
        vpcId: bstVpc.id,
        cidrBlock: '10.10.1.128/26',
        availabilityZone: 'eu-west-1a',
        mapPublicIpOnLaunch: true,
        tags: { Name: 'fh-bst-public1-subnet-eu-west-1a', stack: 'bastian' }
      }),
      productionPrivate1a: new Subnet(this, 'ProductionPrivateSubnet1a', {
        vpcId: prodVpc.id,
        cidrBlock: '10.10.2.0/26',
        availabilityZone: 'eu-west-1a',
        tags: { Name: 'fh-prod-private1-subnet-eu-west-1a', stack: 'Production' }
      }),
      productionPublic1a: new Subnet(this, 'ProductionPublicSubnet1a', {
        vpcId: prodVpc.id,
        cidrBlock: '10.10.2.128/26',
        availabilityZone: 'eu-west-1a',
        mapPublicIpOnLaunch: true,
        tags: { Name: 'fh-prod-public1-subnet-eu-west-1a', stack: 'Production' }
      })
    };

    // Internet Gateways
    const bstIgw = new InternetGateway(this, 'InternetGatewayBastion', {
      tags: { Name: 'fh-eu-bst-igw' }
    });

    const prodIgw = new InternetGateway(this, 'InternetGatewayProduction', {
      tags: { Name: 'fh-eu-prod-igw' }
    });


    // Attach Internet Gateways to VPCs
    new InternetGatewayAttachment(this, 'InternetGatewayAttachmentBastion', {
      vpcId: bstVpc.id,
      internetGatewayId: bstIgw.id
    });

    new InternetGatewayAttachment(this, 'InternetGatewayAttachmentProduction', {
      vpcId: prodVpc.id,
      internetGatewayId: prodIgw.id
    });


    // Route Tables
    const bstPrivateRtb = new RouteTable(this, 'BastionEUPrivateRTB', {
      vpcId: bstVpc.id,
      tags: { Name: 'fh-bst-eu-private-rtb', stack: 'production' }
    });

    const bstPublicRtb = new RouteTable(this, 'BastionEUPublicRTB', {
      vpcId: bstVpc.id,
      tags: { Name: 'fh-bst-eu-public-rtb', stack: 'production' }
    });

    const prodPrivateRtb = new RouteTable(this, 'ProductionEUPrivateRTB', {
      vpcId: prodVpc.id,
      tags: { Name: 'fh-prod-eu-private-rtb', stack: 'production' }
    });

    const prodPublicRtb = new RouteTable(this, 'ProductionEUPublicRTB', {
      vpcId: prodVpc.id,
      tags: { Name: 'fh-prod-eu-public-rtb', stack: 'production' }
    });

    // Route Table Associations
    new RouteTableAssociation(this, 'BastionEUPrivateRTBPrivateSubnet1a', {
      routeTableId: bstPrivateRtb.id,
      subnetId: subnets.bastionPrivate1a.id
    });

    new RouteTableAssociation(this, 'BastionEUPublicRTBPublicSubnet1a', {
      routeTableId: bstPublicRtb.id,
      subnetId: subnets.bastionPublic1a.id
    });

    // VPC Peering Connection
    const vpcPeering = new VpcPeeringConnection(this, 'VPCPeeringBstEuProd', {
      vpcId: bstVpc.id,
      peerVpcId: prodVpc.id,
      peerRegion: 'eu-west-1',
      tags: { Name: 'BstEuVPC-ProdEuVPC-Peering' }
    });
    
    // Security Groups
    const sgJumpbox = new SecurityGroup(this, 'SGbstjumpbox', {
      vpcId: bstVpc.id,
      description: 'Allow SSH access from a specific IP',
      tags: { Name: 'SGbstjumpbox' }
    });   

    //Security Groups Rules

    new SecurityGroupRule(this, 'SSHIngress', {
      cidrBlocks: ['87.198.109.106/32'],
      fromPort: 22,
      protocol: 'tcp',
      securityGroupId: sgJumpbox.id,
      toPort: 22,
      type: "ingress",
    });


    new SecurityGroupRule(this, 'EGRESS', {
      protocol: '-1',
      fromPort: 0,
      toPort: 0,
      securityGroupId: sgJumpbox.id,
      cidrBlocks: ['0.0.0.0/0'],
      type: "egress",
    });    

    // Instances
    const jumpServer = new Instance(this, 'BstJumpServerInstance', {
      ami: 'ami-0d64bb532e0502c46',
      instanceType: 't2.micro',
      subnetId: subnets.bastionPublic1a.id,
      securityGroups: [sgJumpbox.id],
      tags: { Name: 'fh-eu-bst-jump-01' }
    });

    new TerraformOutput(this, 'JumpServerPublicIP', {
      value: jumpServer.publicIp
    });


}
}

const app = new App();
new MyStack(app, 'MyStack');
app.synth();
