import os


def test_src_directory_exists():
    assert os.path.isdir("src")


def test_analysis_directory_exists():
    assert os.path.isdir("src/analysis")
    assert os.path.exists("src/analysis/__init__.py")


def test_ui_directory_exists():
    assert os.path.isdir("src/ui")
    assert os.path.exists("src/ui/__init__.py")


def test_root_init_exists():
    assert os.path.exists("src/__init__.py")
