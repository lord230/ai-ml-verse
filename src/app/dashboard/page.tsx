'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { BrainCircuit, Cpu, Database, Presentation, GraduationCap, LogOut, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ML_FACTS = [
    "The first artificial neural network was created in 1943 by Warren McCulloch and Walter Pitts, modeling a simple neural network with electrical circuits.",
    "The term 'Machine Learning' was coined by Arthur Samuel in 1959 while working at IBM on a checkers-playing program.",
    "AlphaGo's victory against Lee Sedol in 2016 was a watershed moment, using deep neural networks and Monte Carlo Tree Search.",
    "A single training run for GPT-3 cost an estimated 4.6 million dollars in compute resources.",
    "The vanishing gradient problem, which plagued deep neural networks for decades, was largely solved by the ReLU activation function and better initialization methods.",
    "Geoffrey Hinton, Yann LeCun, and Yoshua Bengio shared the 2018 Turing Award for their foundational work in Deep Learning.",
    "Convolutional Neural Networks were heavily inspired by the biological processes in the visual cortex of animals.",
    "The Transformer architecture, introduced by Google in 2017 in 'Attention Is All You Need', revolutionized NLP by discarding recurrent units entirely.",
    "Support Vector Machines map data to a high-dimensional feature space to categorize data points, even when not linearly separable.",
    "Overfitting occurs when a model learns the training data almost perfectly, but fails to generalize to unseen data.",
    "Geoffrey Hinton popularized the backpropagation algorithm in 1986, which is now the backbone of training artificial neural networks.",
    "The perceptron, invented by Frank Rosenblatt in 1957, was physically realized as a massive custom-built machine called the Mark I Perceptron.",
    "ImageNet contains over 14 million annotated images and played a crucial role in triggering the deep learning boom of the 2010s.",
    "AlexNet, which won the 2012 ImageNet challenge by a large margin, was one of the first major successes of using GPUs for deep learning.",
    "Dropout is a regularization technique where randomly selected neurons are ignored during training, preventing the network from over-relying on specific weights.",
    "Reinforcement Learning involves an agent learning to make decisions by performing actions in an environment to maximize cumulative reward.",
    "Long Short-Term Memory (LSTM) networks were introduced by Sepp Hochreiter and Jürgen Schmidhuber in 1997 to solve the vanishing gradient problem in RNNs.",
    "Generative Adversarial Networks (GANs) involve two networks playing a continuous adversarial game: a generator creating fake data and a discriminator trying to detect it.",
    "Transfer Learning allows models trained on large, general datasets to be fine-tuned on smaller, specialized datasets, saving massive amounts of compute time.",
    "Zero-shot learning enables a model to recognize concepts it has never explicitly seen during training.",
    "Natural Language Processing models represent words as dense vectors called embeddings, mapping semantic relationships mathematically.",
    "K-Nearest Neighbors is an instance-based learning algorithm that doesn't build a general internal model, but simply stores all training data.",
    "Gradient Descent is an optimization algorithm that iteratively moves toward the minimum of a cost function.",
    "Stochastic Gradient Descent calculates the error and updates the model for each individual example, leading to faster but noisier updates.",
    "Adam (Adaptive Moment Estimation) is an optimization algorithm that computes adaptive learning rates for each parameter.",
    "The No Free Lunch Theorem in machine learning states that no single algorithm works best for every possible problem.",
    "Random Forests construct a multitude of decision trees at training time and output the mode of the classes for classification.",
    "A confusion matrix allows visualization of the performance of a supervised learning algorithm.",
    "Precision is the fraction of relevant instances among the retrieved instances, while recall is the fraction of relevant instances that were retrieved.",
    "F1 score is the harmonic mean of precision and recall, useful when classes are highly imbalanced.",
    "Principal Component Analysis (PCA) is a dimensionality reduction technique used to shrink large datasets while preserving as much variation as possible.",
    "K-Means clustering aims to partition n observations into k clusters in which each observation belongs to the cluster with the nearest mean.",
    "Autoencoders are neural networks configured to simply copy their inputs to their outputs to learn efficient data codings.",
    "Tensors are multi-dimensional arrays; a scalar is a 0D tensor, a vector is 1D, and a matrix is 2D.",
    "Batch normalization speeds up neural network training by normalizing the inputs of each layer.",
    "Recurrent Neural Networks (RNNs) have loops in them, allowing information to persist across sequential inputs.",
    "Word2Vec, introduced in 2013, demonstrated that vector representations of words could capture syntactic and semantic word relationships.",
    "BERT (Bidirectional Encoder Representations from Transformers) reads text sequentially in both directions at once.",
    "A hyperparameter is a parameter whose value is set before the learning process begins.",
    "Cross-validation is a resampling procedure used to evaluate machine learning models on a limited data sample.",
    "Data augmentation increases the amount of training data using techniques like cropping, padding, and flipping to help models generalize.",
    "Ensemble learning uses multiple learning algorithms to obtain better predictive performance than could be obtained from any constituent learning algorithm alone.",
    "The Curse of Dimensionality refers to various phenomena that arise when analyzing and organizing data in high-dimensional spaces.",
    "Underfitting occurs when a statistical model or machine learning algorithm cannot adequately capture the underlying structure of the data.",
    "A sigmoid function maps any real value into another value between 0 and 1, often used for binary classification probabilities.",
    "The Softmax function normalizes a vector of K real numbers into a probability distribution of K possible outcomes.",
    "YOLO (You Only Look Once) is an incredibly fast, real-time object detection algorithm that processes entire images in a single evaluation.",
    "Self-supervised learning allows models to learn from unlabelled data by framing a supervised learning task from the data itself.",
    "Few-shot learning aims to build accurate models with highly limited training data.",
    "MoE (Mixture of Experts) models selectively activate different parts of a neural network depending on the specific input data, increasing efficiency."
];

const TOOLS = [
    { href: '/tools/model-cost-calculator', label: 'Model Cost Simulator', description: 'Estimate VRAM, training time, and GPU costs.', icon: Cpu, color: 'indigo' },
    { href: '/tools/dataset-explorer', label: 'Dataset Explorer', description: 'Analyze CSV files for correlations and statistics.', icon: Database, color: 'teal' },
    { href: '/visuals', label: 'ML Visual Playground', description: 'Interactive gradient descent and decision boundary visualizations.', icon: Presentation, color: 'rose' },
    { href: '/learn/cnn-roadmap', label: 'Mastering CNNs', description: 'Step by step roadmap from Calculus to Vision Transformers.', icon: GraduationCap, color: 'emerald' },
    { href: '/learn/transformers', label: 'Mastering Transformers', description: 'Build a Transformer from scratch with interactive visualizations.', icon: BrainCircuit, color: 'purple' },
    { href: '/architecture-playground', label: 'Architecture Playground', description: 'Compare parameter counts across MLP, CNN, Transformer architectures.', icon: Cpu, color: 'amber' },
];

const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30 hover:border-teal-500/60',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:border-rose-500/60',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500/60',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-500/60',
};

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [welcomeMessage, setWelcomeMessage] = useState('Welcome back!');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = sessionStorage.getItem('userName');
            const storedTimeAwayMs = sessionStorage.getItem('timeAwayMs');

            let displayName = user?.email?.split('@')[0] || '';
            // First check Firebase displayName
            if (user?.displayName) {
                displayName = user.displayName;
            }
            // Then check session storage (from login)
            if (storedName) {
                displayName = storedName;
            }

            if (storedTimeAwayMs) {
                const timeAwaySec = Number(storedTimeAwayMs) / 1000;
                let messageOptions = [`Welcome back, ${displayName}! 👋`];

                if (timeAwaySec < 3600) {
                    // Less than an hour
                    messageOptions = [
                        `you couldn't stay away for long! 😂`,
                        `back so soon? We love the dedication! 🔥`,
                        `just checking in? Let's go! 🚀`
                    ];
                } else if (timeAwaySec < 86400) {
                    // Less than a day
                    messageOptions = [
                        `good to see you again today! 🚀`,
                        `ready for another session? 🧠`,
                        `hope you had a good break! Let's dive in. 💻`
                    ];
                } else if (timeAwaySec < 604800) {
                    // Less than a week
                    messageOptions = [
                        `it's been a few days! Let's get back to work. ⚡`,
                        `missed you around here! 🌟`,
                        `time to brush up on those ML skills! 📚`
                    ];
                } else {
                    // More than a week
                    messageOptions = [
                        `long time no see! Ready to catch up? 🕰️`,
                        `where have you been?! Welcome back to the matrix. 🕶️`,
                        `the models missed you! Let's train something new. 🤖`
                    ];
                }

                // Pick a random message from the applicable category
                const randomMsg = messageOptions[Math.floor(Math.random() * messageOptions.length)];
                setWelcomeMessage(`Welcome ${displayName}, ${randomMsg}`);
            } else {
                // Initial login or missing time data
                setWelcomeMessage(displayName ? `Welcome ${displayName}!` : 'Welcome back!');
            }
        }
    }, [user]);

    const [randomFact, setRandomFact] = useState<string>('');
    const [typingCompleted, setTypingCompleted] = useState(false);

    useEffect(() => {
        setRandomFact(ML_FACTS[Math.floor(Math.random() * ML_FACTS.length)]);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Top bar */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <BrainCircuit className="w-6 h-6" />
                        <span className="font-black text-white">AI ML Verse</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 pb-2 h-12 flex items-center">
                        {welcomeMessage.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.05, delay: index * 0.03 }}
                                onAnimationComplete={() => {
                                    if (index === welcomeMessage.length - 1) {
                                        setTypingCompleted(true);
                                    }
                                }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-[3px] h-[32px] md:h-[40px] bg-indigo-500 ml-1 translate-y-1"
                        />
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: typingCompleted ? 1 : 0, y: typingCompleted ? 0 : 10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                            <BrainCircuit className="w-4 h-4" />
                            <span className="font-medium">Did you know?</span> {randomFact}
                        </div>
                    </motion.div>
                </div>

                {/* Tool grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map(({ href, label, description, icon: Icon, color }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`group glass-panel rounded-2xl p-6 border bg-slate-900 transition-all duration-300 hover:-translate-y-1 ${colorMap[color]}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorMap[color].split(' ').slice(0, 2).join(' ')} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{label}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">{description}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 pb-8 border-t border-slate-800/60 pt-8">
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center px-4">
                    <div className="bg-slate-900/40 border border-indigo-500/20 rounded-xl p-6 backdrop-blur-sm shadow-lg w-full max-w-2xl mx-auto">
                        <h3 className="text-indigo-400 font-bold mb-2 font-mono text-sm uppercase tracking-wider">Developer Note</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4 text-center">
                            Hi, I am a B.Tech final year student. I built this platform to keep track of my progress and visually log the concepts I've learned during these 4 years. If you find any inaccuracies in the mathematics or implementations I've posted, please do notify me! This is a constant work in progress.
                        </p>
                        <div className="flex justify-center mt-4">
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=1amit1verma@gmail.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-all font-mono text-sm font-semibold group">
                                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" /> Contact Me
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
