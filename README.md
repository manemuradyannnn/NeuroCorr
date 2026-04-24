🧠 NeuroCorr — Autocorrelation-Based Analysis of Simulated Brain Signals
📌 Overview

NeuroCorr is a full-stack simulation and analysis platform designed to demonstrate how noisy optical signals—similar to those measured in brain imaging techniques—can be transformed into meaningful physiological information using signal processing methods. The project is inspired by Diffuse Correlation Spectroscopy (DCS), a non-invasive technique used in neuroscience to measure blood flow in brain tissue. Through an interactive interface, NeuroCorr allows users to generate synthetic signals, apply autocorrelation, and visualize how underlying motion can be inferred from data that initially appears random and unstructured.

🧬 Scientific Background

Diffuse Correlation Spectroscopy (DCS) is a technique that uses near-infrared light to measure microvascular blood flow within biological tissue. In a typical DCS system, light is introduced into the scalp and propagates through tissue via multiple scattering events. As photons travel through the brain, they interact with both static structures and moving red blood cells. The motion of these cells induces subtle fluctuations in the detected light intensity over time. These fluctuations are recorded as a time-series signal; however, due to the complex scattering environment and continuous biological motion, the resulting signal appears highly noisy and stochastic.

Despite its apparent randomness, this signal contains embedded information about the dynamics of blood flow. Extracting that information requires a mathematical approach capable of identifying structure within noise.

🔑 Role of Autocorrelation

Autocorrelation is the primary analytical tool used in DCS to interpret these signals. It measures how similar a signal is to itself when shifted in time, thereby capturing how quickly the signal changes. In the context of optical measurements, the rate at which the autocorrelation function decays is directly related to the motion of scattering particles. Faster motion—such as increased blood flow—causes the signal to decorrelate more rapidly, while slower motion leads to a more gradual decay. This relationship allows researchers to estimate a blood flow index from the temporal behavior of the signal rather than from its raw amplitude.

💻 Project Objective

The objective of NeuroCorr is to replicate this process in a controlled, software-based environment. Rather than relying on real experimental hardware, the system generates synthetic signals that mimic the statistical properties of DCS measurements. These signals are then analyzed using autocorrelation to demonstrate how meaningful patterns can be extracted from noisy data. The project is intended both as an educational tool for understanding signal processing concepts and as a proof-of-concept for software-based analysis in biomedical applications.

⚙️ System Architecture

The application is structured as a full-stack system with a React-based frontend and a Python-based backend. The frontend provides an interactive user interface for configuring signal parameters, visualizing generated signals, and displaying analysis results. The backend handles signal generation and performs computational operations such as autocorrelation using numerical libraries. This separation allows for efficient processing while maintaining a responsive and intuitive user experience.

🧪 Signal Simulation

To model different real-world scenarios, the project includes multiple signal types, each representing a distinct condition. A pure sine wave represents an idealized, perfectly periodic system with no noise, serving as a baseline for understanding predictable behavior. A noisy sine wave introduces random fluctuations to simulate realistic biological measurements that are affected by both physiological processes and sensor noise. The photon intensity signal approximates the stochastic fluctuations observed in DCS due to interactions with moving blood cells and is the closest representation of real experimental data. An exponential decay signal models the expected behavior of autocorrelation under steady motion conditions, illustrating how decay rates correspond to flow dynamics. Finally, white noise represents a completely random signal with no temporal structure, serving as a control case to demonstrate the absence of meaningful information.

📊 Data Visualization

The project produces two primary visual outputs. The first is the generated signal plotted in the time domain, where the x-axis represents time and the y-axis represents signal intensity. This graph reflects what a physical detector would measure in a real system and typically appears irregular and difficult to interpret. The second is the autocorrelation function, which plots similarity as a function of time lag. This graph reveals the underlying structure of the signal by showing how quickly it loses similarity over time. The contrast between these two visualizations highlights the transformation from raw data to interpretable information.

⚡ Computational Methods

NeuroCorr implements and compares two methods for computing autocorrelation. The direct method calculates similarity by explicitly comparing the signal with shifted versions of itself, resulting in quadratic time complexity. While conceptually straightforward, this approach becomes inefficient for large datasets. The alternative method uses the Fast Fourier Transform (FFT), which converts the signal into the frequency domain, performs the necessary operations, and then transforms the result back. This approach leverages the Wiener–Khinchin theorem and reduces computational complexity to logarithmic scale, making it significantly more efficient for large-scale data. The project demonstrates that both methods yield equivalent results while differing in performance characteristics.

🧠 Interpretation of Results

The behavior of the autocorrelation function provides direct insight into the properties of the signal. A slow decay indicates that the signal changes gradually over time, corresponding to slower motion within the system. A rapid decay indicates faster fluctuations and therefore higher motion, such as increased blood flow. A flat or near-zero autocorrelation suggests the absence of meaningful structure, indicating that the signal consists primarily of noise. These interpretations form the basis for translating raw measurements into physiological insights.

🌍 Real-World Applications

The principles demonstrated in this project are directly applicable to real-world biomedical contexts. DCS and related techniques are used to monitor brain blood flow in patients with traumatic brain injury, detect ischemic events such as stroke, and study neurovascular coupling in research settings. By enabling non-invasive, real-time measurement of blood flow, these methods provide critical information for diagnosis, treatment planning, and monitoring of neurological conditions.
