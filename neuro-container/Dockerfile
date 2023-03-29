FROM python:3.10
WORKDIR /app

RUN apt-get update

# 0. common dependencies

RUN pip install --upgrade pip
COPY requirements-pipeline-dev.txt .
RUN pip install -r requirements-pipeline-dev.txt

# 1. vinvl-visualbackbone

RUN git clone https://github.com/michelecafagna26/vinvl-visualbackbone.git

WORKDIR /app/vinvl-visualbackbone

RUN pip install -r requirements.txt

WORKDIR /app/vinvl-visualbackbone/scene_graph_benchmark

RUN python setup.py build develop

RUN mkdir -p models

WORKDIR /app/vinvl-visualbackbone/scene_graph_benchmark/models

RUN apt install git-lfs
RUN git-lfs install
RUN git clone https://huggingface.co/michelecafagna26/vinvl_vg_x152c4

# 2. VinVL

WORKDIR /app
RUN git clone https://github.com/NVIDIA/apex.git
COPY patches/apex/setup.py /app/apex/
RUN python apex/setup.py install
RUN git clone --recursive https://github.com/michelecafagna26/VinVL.git /app/apex/VinVL
WORKDIR /app/apex
RUN ./VinVL/Oscar/coco_caption/get_stanford_models.sh
RUN python VinVL/Oscar/setup.py build develop
RUN pip install -r VinVL/Oscar/requirements.txt
RUN mv /app/apex/VinVL/Oscar/transformers /app/apex/VinVL/Oscar/transformers_lib
COPY patches/apex/ /app/apex/


WORKDIR /app

COPY patches/vinvl-visualbackbone/ /app/vinvl-visualbackbone/
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y # TODO: move upper

WORKDIR /app

RUN mv /app/vinvl-visualbackbone/scene_graph_benchmark/models/vinvl_vg_x152c4 /app/vinvl-visualbackbone/scene_graph_benchmark/models/vinvl

WORKDIR /app/apex/VinVL/Oscar/
RUN git clone https://huggingface.co/michelecafagna26/vinvl-base-image-captioning
RUN git clone https://huggingface.co/michelecafagna26/vinvl-base-finetuned-hl-scenes-image-captioning

WORKDIR /app
COPY . /app



WORKDIR /app

# INITIALIZE ALL MODELS
RUN python -c "from pipeline import PipelineVideoPrepare; PipelineVideoPrepare()"


# BACKEND
WORKDIR /app

RUN pip install requests # TODO: move to requirements
