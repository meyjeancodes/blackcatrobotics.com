# Signal Theory for Robot Diagnostics

Reference guide covering Nyquist sampling, Shannon entropy, FFT bearing defect analysis, and Butterworth filtering. Required reading for L2+ certification.

---

## Nyquist-Shannon Sampling Theorem

To accurately reconstruct a signal containing frequency components up to f_max, the sampling rate f_s must satisfy:

```
f_s >= 2 * f_max
```

This minimum rate is called the Nyquist rate. Sampling below this rate causes **aliasing** — high-frequency components appear as lower-frequency artifacts in the sampled signal, corrupting the measurement.

### Practical Implications

- A robot joint vibration sensor monitoring bearing defects up to 400 Hz requires a minimum sampling rate of 800 Hz. In practice, use 2-4x the minimum (1,600-3,200 Hz) to provide anti-aliasing filter margin.
- IMUs typically sample at 400-1,000 Hz to capture human-range motion (< 50 Hz) with substantial margin.
- Anti-aliasing filter: always apply a low-pass filter with cutoff below f_s/2 before sampling to prevent aliasing. Butterworth filters are commonly used for this purpose.

### Example

A ball-pass frequency outer race (BPFO) for a joint bearing is calculated to be 180 Hz. The sensor must sample at a minimum of 360 Hz. To detect the 3rd harmonic (540 Hz), the minimum sampling rate is 1,080 Hz.

---

## Shannon Entropy

Shannon entropy H measures the information content (unpredictability) of a discrete probability distribution:

```
H(X) = -sum[ p(x) * log2(p(x)) ]
```

Where p(x) is the probability of each value x in the signal's amplitude distribution.

### Interpretation

- **H = 0 bits:** Completely predictable signal (constant value) — zero information content
- **H = 1 bit:** Binary signal, equal probability of two states
- **H = log2(N) bits:** Maximum entropy for N equally-probable states (uniform distribution)

### Robotics Applications

**Stuck sensor detection:** A healthy sensor measuring a dynamic physical quantity (joint velocity, force, temperature) should have measurable entropy. A sensor stuck at a constant value produces H ≈ 0. Entropy thresholds:
- Normal joint velocity sensor (walking robot): H ≈ 2.5-4.5 bits (1-hour window)
- Stuck sensor: H < 0.1 bits
- Alert threshold: H < 0.5 bits sustained for > 60 seconds

**Anomaly detection baseline:** Compute H over 30-day rolling windows for each sensor signal. A sudden increase in entropy (noise injection, sensor failure) or decrease (freezing, connection issue) flags for investigation.

**Gait analysis:** Entropy of ground reaction force patterns distinguishes regular walking (lower entropy) from degraded gait after joint wear (higher entropy from irregular patterns).

---

## FFT Bearing Defect Frequency Formulas

Vibration signature of a rotating bearing contains frequency components at specific characteristic defect frequencies. FFT analysis of accelerometer data detects these frequencies to identify which component is damaged.

### Ball Pass Frequency Outer Race (BPFO)

Frequency at which balls pass a defect on the outer race:

```
BPFO = (N/2) * (RPM/60) * (1 - (d/D) * cos(alpha))
```

Where:
- N = number of rolling elements (balls or rollers)
- RPM = shaft rotation speed in revolutions per minute
- d = rolling element diameter (mm)
- D = pitch circle diameter (mm) — the circle passing through the centers of the rolling elements
- alpha = contact angle in degrees (0 degrees for radially loaded bearings)

### Ball Pass Frequency Inner Race (BPFI)

Frequency at which balls pass a defect on the inner race:

```
BPFI = (N/2) * (RPM/60) * (1 + (d/D) * cos(alpha))
```

### Ball Spin Frequency (BSF)

Frequency at which a defect on the ball surface rotates into contact:

```
BSF = (D/(2*d)) * (RPM/60) * (1 - ((d/D) * cos(alpha))^2)
```

### Worked Example

Bearing parameters: N=8 balls, d=6mm, D=40mm, alpha=0 degrees, shaft speed=900 RPM.

```
BPFO = (8/2) * (900/60) * (1 - (6/40) * cos(0))
     = 4 * 15 * (1 - 0.15)
     = 60 * 0.85
     = 51 Hz

BPFI = 4 * 15 * (1 + 0.15)
     = 60 * 1.15
     = 69 Hz
```

### Interpreting FFT Results

A bearing defect produces vibration at the characteristic frequency plus harmonics (2x, 3x, etc.). Finding multiple harmonics of the same base frequency significantly increases diagnostic confidence:

- Single peak at BPFO: possible (low confidence)
- Peaks at BPFO and 2*BPFO: probable (medium confidence)
- Peaks at BPFO, 2*BPFO, and 3*BPFO: confirmed (high confidence)

**Sideband modulation:** Peaks at BPFO ± shaft_frequency (sidebands) indicate the defect magnitude is modulated by shaft rotation — the defect comes in and out of the load zone once per shaft revolution. Sidebands indicate a more advanced defect compared to isolated peaks.

---

## Butterworth Low-Pass Filtering

The Butterworth filter provides a maximally flat frequency response in the passband — no ripple — with a smooth rolloff in the stopband. It is preferred over simple moving averages for robot signal processing because:

1. Flat passband preserves the true signal amplitude
2. Steeper rolloff than moving average for the same filter order
3. Phase response is monotonic (no oscillation)

### Transfer Function

The Butterworth filter of order n has the magnitude response:

```
|H(omega)| = 1 / sqrt(1 + (omega/omega_c)^(2n))
```

Where:
- omega = frequency in rad/s
- omega_c = cutoff frequency (3dB point) in rad/s
- n = filter order (higher order = steeper rolloff, more phase delay)

### Filter Order Selection

- Order 1: 20 dB/decade rolloff — gentle, minimal phase delay
- Order 2: 40 dB/decade — good balance of attenuation and delay
- Order 4: 80 dB/decade — steep rolloff, significant phase delay
- Order 8: 160 dB/decade — near-brick-wall, substantial group delay

For robot joint velocity estimation: Order 2, cutoff at 50 Hz is a typical starting point.

### Python Implementation

```python
from scipy.signal import butter, sosfilt

def butter_lowpass(data, cutoff_hz, sample_rate_hz, order=2):
    """Apply Butterworth low-pass filter to a signal."""
    nyquist = sample_rate_hz / 2.0
    normal_cutoff = cutoff_hz / nyquist
    # Use second-order sections (sos) for numerical stability
    sos = butter(order, normal_cutoff, btype='low', output='sos')
    return sosfilt(sos, data)

# Example: filter 500Hz IMU data, remove noise above 50Hz
filtered = butter_lowpass(imu_accel_z, cutoff_hz=50, sample_rate_hz=500, order=2)
```

### Moving Average Comparison

A moving average of window length W is equivalent to a sinc-shaped frequency response with:
- Notches at multiples of 1/W (uneven frequency response)
- Phase delay of W/2 samples
- Poor stopband attenuation between notches

For a 10-sample moving average at 500 Hz: the first notch is at 50 Hz, but signals at 25 Hz and 75 Hz are passed with reduced attenuation — unpredictable filter behavior. Use Butterworth for diagnostic signal processing wherever accurate frequency content matters.
