const chartsFiles = [
    {
        path: 'Chart.yaml',
        // prettier-ignore
        generate: (packageName: string) =>
`apiVersion: v1
appVersion: '1.0'
description: A Helm chart for Kubernetes
name: ${packageName}
version: 0.1.0
`,
    },
    {
        path: 'values.yaml',
        // prettier-ignore
        generate: (packageName: string) =>
`fullnameOverride: ${packageName}
replicaCount: 1
image:
    repository: ${packageName}
    tag: #{Build.BuildId}#
    pullPolicy: IfNotPresent
    imagePullSecretName: acr-takeprivate-secret
imagePullSecrets: []
service:
    type: ClusterIP
    port: 80

probes:
    enabled: false

ingress:
    enabled: true
    whitelist:
        ranges:
    annotations:
        kubernetes.io/ingress.class: nginx
        nginx.ingress.kubernetes.io/proxy-body-size: '0'
    hostName: hostName
    tls:
        secretName: secretName
secrets: {}
resources:
    limits:
        cpu: cpuLimit
        memory: memoryLimit
    requests:
        cpu: cpuRequests
        memory: memoryRequests
nodeSelector: {}

tolerations: []

affinity: {}

environment:
    stage: staging

appSettings:
    configMap: ${packageName}
    path: /app/src/config/appsettings.json
    subPath: appsettings.json

autoscale:
    minReplicas: minReplicas
    maxReplicas: maxReplicas
    averageCPUUtilization: averageCpuUtilization

team: csgrowth

annotations: {}
`,
    },
    {
        path: 'templates/_helpers.tpl',
        // prettier-ignore
        generate: (packageName:string) =>
`{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "${packageName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "${packageName}.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${packageName}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
`,
    },
];

export default chartsFiles;
