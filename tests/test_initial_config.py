import yaml
import os

def test_coderabbit_config_exists():
    assert os.path.exists(".coderabbit.yaml")

def test_coderabbit_config_language():
    with open(".coderabbit.yaml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    assert config.get("language") == "ja-JP"

def test_docker_compose_exists():
    assert os.path.exists("docker-compose.yml")

def test_docker_compose_version():
    with open("docker-compose.yml", "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    assert config.get("version") in ["3", "3.8", "3.9"] or "services" in config
