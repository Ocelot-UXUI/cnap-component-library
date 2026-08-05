import awsEks from '@/assets/illustrations/aws.svg';
import bceCce from '@/assets/illustrations/bce.svg';
import eksCce from '@/assets/illustrations/eks-cce.svg';
import eksEci from '@/assets/illustrations/eks-eci.svg';
import eksFed from '@/assets/illustrations/eks-fed.svg';
import sci from '@/assets/illustrations/eks-sci.svg';
import gcpGke from '@/assets/illustrations/gcp.svg';
import k0s from '@/assets/illustrations/k0s.svg';
import k8s from '@/assets/illustrations/k8s.svg';

const connectorIconMap: Record<string, string> = {
    'EKS-CCE': eksCce,
    'EKS-ECI': eksEci,
    'EKS-FED': eksFed,
    'SCI': sci,
    'BCE-CCE': bceCce,
    'AWS-EKS': awsEks,
    'GCP-GKE': gcpGke,
    'K8S': k8s,
    'K0S': k0s,
};

export function getClusterConnectorIcon(connector?: string): string | undefined {
    if (!connector) {
        return undefined;
    }
    return connectorIconMap[connector.toUpperCase()];
}
