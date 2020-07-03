import * as param from '@jkcfg/std/param'
import * as std from '@jkcfg/std'

const config = param.all();
let output = [];
const name = "firekube";
const namespace = "weavek8sops";

let cluster = {
  apiVersion: "cluster.x-k8s.io/v1alpha3",
  kind: "Cluster",
  metadata: {
    name: name,
    namespace: namespace,
  },
  spec: {
    clusterNetwork: {
      services: {
        cidrBlocks: ["10.96.0.0/12"],
      },
      pods: {
        cidrBlocks: ["192.168.0.0/16"],
      },
      serviceDomain: "cluster.local",
    },
    infrastructureRef: {
      apiVersion: "cluster.weave.works/v1alpha3",
      kind: "ExistingInfraCluster",
      name: name,
    },
  }
}

let eic = {
  apiVersion: "cluster.weave.works/v1alpha3",
  kind: "ExistingInfraCluster",
  metadata: {
    name: name,
    namespace: namespace,
  },
  spec: {
    user: "root",
    os: {
      files: [{
        source: {
          configmap: "repo",
          key: "kubernetes.repo",
        },
        destination: "/etc/yum.repos.d/kubernetes.repo",
      },
      {
        source: {
          configmap: "repo",
          key: "docker-ce.repo",
        },
        destination: "/etc/yum.repos.d/docker-ce.repo",
      },
      {
        source: {
          configmap: "docker",
          key: "daemon.json",
        },
        destination: "/etc/docker/daemon.json",
      }]
    },
    cri: {
      kind: "docker",
      package: "docker-ce",
      version: "19.03.8",
    },
    kubeletArguments: [{
      name: "alsologtostderr",
      value: "true",
    },
    {
      name: "container-runtime",
      value: "docker",
    }],
    apiServer: {
      extraArguments: [{
        name: "alsologtostderr",
        value: "true"
      }]
    }
  }
}

if (config.externalLoadBalancer !== undefined) {
  eic.spec.apiServer.externalLoadBalancer = `${config.externalLoadBalancer}`
}

output.push({ path: 'cluster.yaml', value: [cluster, eic], format: std.Format.YAMLStream });

export default output;
