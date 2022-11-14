import scanner from 'sonarqube-scanner';

const sonarHostURL = process.env.SONAR_HOST_URL;
const sonarToken = process.env.SONAR_TOKEN;

if (!sonarHostURL) {
    console.error('Environment variable SONAR_HOST_URL is not defined.');
    process.exitCode = 1;
}

if (!sonarToken) {
    console.error('Environment variable SONAR_TOKEN is not defined.');
    process.exitCode = 1;
}

if (!process.exitCode) {
    scanner({
        serverUrl: sonarHostURL,
        token: sonarToken,
        options: {
            "sonar.sources": "src",
            "sonar.exclusions": "**/test/**",
            "sonar.tests=": "src",
            "sonar.test.inclusions": "**/test**",
        }
    }, () => process.exit())
}