// Fill out your copyright notice in the Description page of Project Settings.

#include "TexasRootSettings.h"

UTexasRootSettings::UTexasRootSettings()
{
    // Default values for RPC endpoints
    PolygonRpcEndpoint = TEXT("https://polygon-rpc.com");
    SolanaRpcEndpoint = TEXT("https://api.mainnet-beta.solana.com");
}
